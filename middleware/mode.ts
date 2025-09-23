import { Request, Response, NextFunction } from 'express';
import fs from 'fs/promises';

let currentMode = 'development';

export const initializeMode = async () => {
    try {
        const modeData = await fs.readFile('mode.json', 'utf-8');
        const { mode } = JSON.parse(modeData);
        if (['development', 'certification', 'production'].includes(mode)) {
            currentMode = mode;
        }
    } catch (error) {
        console.log('mode.json not found, defaulting to development mode.');
    }
};

export const getMode = () => currentMode;

export const setMode = async (newMode: string) => {
    if (currentMode === 'production') {
        throw new Error('Cannot change mode from production.');
    }
    if (!['development', 'certification', 'production'].includes(newMode)) {
        throw new Error('Invalid mode specified.');
    }
    await fs.writeFile('mode.json', JSON.stringify({ mode: newMode }));
    currentMode = newMode;
};

export const modeMiddleware = (req: Request, res: Response, next: NextFunction) => {
    req.app.set('mode', currentMode);
    next();
};
