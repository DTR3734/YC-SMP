

// FIX: Reverted to `import express = require('express')` to ensure compatibility
// with @types/express and resolve type errors for Express middleware and route handlers.
import express = require('express');
import path from 'path';
import https from 'https';
import fs from 'fs';
import { getServiceGroup, getServiceMetadata } from './services/peppolService.server';
import { login, changePassword } from './services/authService.server';
import * as userService from './services/userService.server';
import * as participantService from './services/participantService.server';
import { ApiError } from './utils/errors.server';
import { initializeDatabase } from './database/database';
import { initializeMode, getMode, setMode, modeMiddleware } from './middleware/mode';

const app = express();
const port = 3001;

// Middleware to parse JSON bodies. This must come before any API routes.
app.use(express.json());
app.use(modeMiddleware);


// --- PEPPOL SMP Server Endpoints ---
// These routes handle the core PEPPOL SMP functionality, responding to GET requests
// for participant information. They are defined before the static file and /api routes
// to ensure they are matched correctly.

// Matches a URL path that looks like a PEPPOL participant identifier (e.g., "iso6523-actorid-upis::01234567")
// and serves the corresponding Service Group XML.
app.get(/^\/([^/]+::[^/]+)$/, async (req, res, next) => {
    // Simple check to avoid conflicts with static file requests like "styles.css"
    if (req.path.includes('.')) {
        return next();
    }
    // The participant ID is the full path, decoded. e.g., /iso6523-actorid-upis::012345
    const participantId = decodeURIComponent(req.path.substring(1));
    console.log(`[SMP Server] Received ServiceGroup request for: ${participantId}`);

    try {
        const xml = await getServiceGroup(participantId);
        res.type('application/xml').send(xml);
    } catch (err) {
        if (err instanceof Error && err.message.includes('not found')) {
            return res.status(404).type('text/plain').send(err.message);
        }
        console.error(`[SMP Server] Error retrieving ServiceGroup for ${participantId}:`, err);
        res.status(500).type('text/plain').send('An internal server error occurred.');
    }
});

// Matches a URL for a specific service metadata document and serves the
// corresponding SignedServiceMetadata XML.
app.get(/^\/([^/]+::[^/]+)\/services\/(.+)$/, async (req, res) => {
    // req.params[0] is the first capture group (participantId), req.params[1] is the second (documentId)
    const participantId = decodeURIComponent(req.params[0]);
    const documentId = decodeURIComponent(req.params[1]);
    console.log(`[SMP Server] Received ServiceMetadata request for: ${participantId} and document: ${documentId}`);

    try {
        const xml = await getServiceMetadata(participantId, documentId);
        res.type('application/xml').send(xml);
    } catch (err) {
        if (err instanceof Error && err.message.includes('not found')) {
            return res.status(404).type('text/plain').send(err.message);
        }
        console.error(`[SMP Server] Error retrieving ServiceMetadata for ${participantId}:`, err);
        res.status(500).type('text/plain').send('An internal server error occurred.');
    }
});


// --- API Router Setup ---
// Group all administrative API endpoints under a single router to namespace them.
const apiRouter = express.Router();

// Health Check
apiRouter.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Authentication
apiRouter.post('/auth/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await login(username, password);
        if (user) {
            res.json({ success: true, user });
        } else {
            res.status(401).json({ success: false, error: 'Invalid username or password.' });
        }
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server error during login.' });
    }
});

// User Management
apiRouter.get('/users', async (req, res) => {
    try {
        const users = await userService.getUsers();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Failed to retrieve users.' });
    }
});

apiRouter.post('/users', async (req, res) => {
    try {
        await userService.addUser(req.body);
        res.status(201).send();
    } catch (err) {
        if (err instanceof Error && err.message.includes('UNIQUE constraint failed')) {
            return res.status(409).json({ error: 'Username already exists.' });
        }
        res.status(500).json({ error: 'Failed to add user.' });
    }
});

apiRouter.put('/users/:id', async (req, res) => {
    try {
        await userService.updateUser(req.params.id, req.body);
        res.status(200).send();
    } catch (err) {
        res.status(500).json({ error: 'Failed to update user.' });
    }
});

apiRouter.put('/users/:id/password', async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    try {
        const result = await changePassword(req.params.id, oldPassword, newPassword);
         if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error while changing password.' });
    }
});

apiRouter.delete('/users/:id', async (req, res) => {
    try {
        await userService.deleteUser(req.params.id);
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete user.' });
    }
});

// SMP Participant Management
apiRouter.get('/participants', async (req, res) => {
    try {
        const participants = await participantService.getParticipants();
        res.json(participants);
    } catch (err) {
        res.status(500).json({ error: 'Failed to retrieve participants.' });
    }
});

apiRouter.post('/participants', async (req, res) => {
    try {
        await participantService.addParticipant(req.body);
        res.status(201).send();
    } catch (err) {
        res.status(500).json({ error: 'Failed to add participant.' });
    }
});

apiRouter.put('/participants/:id', async (req, res) => {
    try {
        await participantService.updateParticipant(req.params.id, req.body);
        res.status(200).send();
    } catch (err) {
        res.status(500).json({ error: 'Failed to update participant.' });
    }
});

apiRouter.delete('/participants/:id', async (req, res) => {
    try {
        await participantService.deleteParticipant(req.params.id);
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete participant.' });
    }
});

// Application Mode
apiRouter.get('/mode', (req, res) => {
    res.json({ mode: getMode() });
});

apiRouter.put('/mode', async (req, res) => {
    const { mode } = req.body;
    try {
        await setMode(mode);
        res.json({ success: true, mode: getMode() });
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ success: false, error: error.message });
        } else {
            res.status(500).json({ success: false, error: 'An unknown error occurred' });
        }
    }
});

// Mount the API router at the /api prefix
app.use('/api', apiRouter);


// --- Static File Serving & Client-side Routing Fallback ---
// This must come AFTER the API router is mounted.

// Use `process.cwd()` to robustly get the project root, for both dev and prod.
const staticFilesPath = process.cwd();
// Serve the static files from the project root.
app.use(express.static(staticFilesPath));

// This must be the last GET route. It sends the index.html for any non-API GET request,
// allowing the client-side router to take over.
app.get('*', (req, res) => {
  res.sendFile(path.join(staticFilesPath, 'index.html'));
});

// --- Server Startup ---
async function startServer() {
    try {
        await initializeMode();
        // Ensure database is initialized before listening for requests to prevent race conditions.
        await initializeDatabase();
        
        const keyPath = path.join(process.cwd(), 'key.pem');
        const certPath = path.join(process.cwd(), 'cert.pem');

        if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
            console.error('\\nERROR: SSL certificates not found.');
            console.error('Please run "npm run generate-certs" to create self-signed certificates and then restart the server.');
            console.error('------------------------------------------------------------------------------------------\\n');
            process.exit(1);
        }

        const options = {
            key: fs.readFileSync(keyPath),
            cert: fs.readFileSync(certPath)
        };
        
        https.createServer(options, app).listen(port, () => {
            console.log(`PEPPOL SMP server listening on https://localhost:${port} in ${getMode()} mode`);
        });

    } catch (err) {
        console.error("Failed to initialize database and start server:", err);
        process.exit(1);
    }
}

startServer();
