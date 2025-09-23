
import { Pool, Client } from 'pg';
import { MOCK_USERS } from '../services/userService.server';
import { MOCK_PARTICIPANTS } from '../services/participantService.server';
import { getMockLookupData } from '../services/peppolService.server';
import { hashPassword } from '../utils/security.server';

let pool: Pool | null = null;

/**
 * Provides a singleton, memoized, promise-based connection to the PostgreSQL database.
 * This ensures the database is connected before any operations are performed.
 * @returns A promise that resolves with the database connection pool.
 */
export const getDb = (): Pool => {
    if (!pool) {
        pool = new Pool({
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
        });
    }
    return pool;
};

export const initializeDatabase = async () => {
    const pool = getDb();
    const client = await pool.connect();

    try {
        console.log('Initializing database schema...');

        // User Management Tables (with secure password storage)
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                password_salt TEXT NOT NULL,
                role TEXT NOT NULL,
                createdAt TIMESTAMP NOT NULL
            )
        `);

        // SMP Manager Tables
        await client.query(`
            CREATE TABLE IF NOT EXISTS managed_participants (
                id TEXT PRIMARY KEY,
                participantId TEXT,
                name TEXT,
                smpIdentifier TEXT,
                status TEXT,
                createdAt TIMESTAMP,
                updatedAt TIMESTAMP
            )
        `);

        // PEPPOL Lookup Data Tables
        await client.query(`
            CREATE TABLE IF NOT EXISTS peppol_lookups (
                id TEXT PRIMARY KEY
            )
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS peppol_service_groups (
                id SERIAL PRIMARY KEY,
                lookup_id TEXT REFERENCES peppol_lookups(id),
                doc_scheme TEXT,
                doc_value TEXT
            )
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS peppol_processes (
                id SERIAL PRIMARY KEY,
                service_group_id INTEGER REFERENCES peppol_service_groups(id),
                process_scheme TEXT,
                process_value TEXT
            )
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS peppol_endpoints (
                id SERIAL PRIMARY KEY,
                process_id INTEGER REFERENCES peppol_processes(id),
                transport_profile TEXT,
                endpoint_reference TEXT,
                require_business_level_signature BOOLEAN,
                certificate_details TEXT
            )
        `);

        // Add indexes for performance
        await client.query(`CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_participants_participantId ON managed_participants(participantId)`);

        console.log('Schema initialized.');
        console.log('Seeding initial data if necessary...');

        // --- Seeding Logic ---

        // Seed Users with hashed passwords
        const userCountResult = await client.query('SELECT COUNT(*) as count FROM users');
        const userCount = parseInt(userCountResult.rows[0].count);

        if (userCount === 0) {
            console.log('Seeding users table...');
            const { hash, salt } = hashPassword('password');
            await client.query('INSERT INTO users (id, username, password_hash, password_salt, role, createdAt) VALUES ($1, $2, $3, $4, $5, $6)', 
                ['1', 'admin', hash, salt, 'admin', new Date().toISOString()]);
        }

    } finally {
        client.release();
    }

    console.log('Database initialization complete.');
};
