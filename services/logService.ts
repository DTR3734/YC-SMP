import type { LogEntry, LogLevel } from '../types';

let logs: LogEntry[] = [];
// Using a Set ensures that each callback is unique.
const subscribers: Set<(logs: LogEntry[]) => void> = new Set();

const MAX_LOG_ENTRIES = 200;

// Notifies all subscribed components about a change in the logs.
const notify = () => {
    // We pass a new array copy to subscribers to prevent direct mutation.
    subscribers.forEach(callback => callback([...logs]));
};

const add = (level: LogLevel, message: string): void => {
    // To prevent memory issues, we cap the number of log entries.
    if (logs.length >= MAX_LOG_ENTRIES) {
        logs.shift(); // Remove the oldest log entry.
    }
    logs.push({ timestamp: new Date(), level, message });
    notify();
};

export const logService = {
    info: (message: string) => add('INFO', message),
    warn: (message: string) => add('WARN', message),
    error: (message: string) => add('ERROR', message),
    
    /**
     * Returns a copy of the current logs.
     */
    get: (): LogEntry[] => [...logs],
    
    /**
     * Replaces the entire log history. Used for restoring from a backup.
     * @param newLogs The array of LogEntry objects to set.
     */
    set: (newLogs: LogEntry[]): void => {
        // When restoring, it's crucial to convert timestamp strings back to Date objects.
        logs = newLogs.map(log => ({ ...log, timestamp: new Date(log.timestamp) }));
        notify();
    },

    /**
     * Clears all log entries.
     */
    clear: (): void => {
        const wasEmpty = logs.length === 0;
        logs = [];
        if (!wasEmpty) {
            logService.warn('Application logs cleared by user.');
        }
        notify();
    },

    /**
     * Subscribes a component to log updates.
     * @param callback The function to call when logs change.
     * @returns A function to unsubscribe.
     */
    subscribe: (callback: (logs: LogEntry[]) => void): (() => void) => {
        subscribers.add(callback);
        // Return a cleanup function to allow components to unsubscribe.
        return () => subscribers.delete(callback);
    },
};