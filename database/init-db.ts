import { initializeDatabase, getDb } from './database';

const run = async () => {
    try {
        await initializeDatabase();
        console.log("Database initialized successfully.");
    } catch (error) {
        console.error("Failed to initialize database:", error);
    } finally {
        const pool = getDb();
        pool.end();
    }
};

run();
