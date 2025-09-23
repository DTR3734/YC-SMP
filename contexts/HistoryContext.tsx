import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import type { HistoryEntry } from '../types';
import { logService } from '../services/logService';

interface HistoryContextType {
    history: HistoryEntry[];
    addHistoryItem: (item: { participantId: string }) => void;
    clearHistory: () => void;
    setHistory: (history: HistoryEntry[]) => void;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

const MAX_HISTORY_ITEMS = 50;

export const HistoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [history, setHistory] = useState<HistoryEntry[]>(() => {
        try {
            const storedHistory = localStorage.getItem('peppol-smp-history');
            if (storedHistory) {
                const parsed = JSON.parse(storedHistory);
                // Convert timestamp strings back to Date objects
                return parsed.map((item: any) => ({ ...item, timestamp: new Date(item.timestamp) }));
            }
        } catch (error) {
            console.error('Failed to parse history from localStorage', error);
            // FIX: logService.error expects a single string argument.
            logService.error(`Failed to parse history from localStorage: ${error instanceof Error ? error.message : String(error)}`);
        }
        return [];
    });

    useEffect(() => {
        try {
            localStorage.setItem('peppol-smp-history', JSON.stringify(history));
        } catch (error) {
            console.error('Failed to save history to localStorage', error);
            // FIX: logService.error expects a single string argument.
            logService.error(`Failed to save history to localStorage: ${error instanceof Error ? error.message : String(error)}`);
        }
    }, [history]);

    const addHistoryItem = (newItem: { participantId: string }) => {
        setHistory(prevHistory => {
            // Remove any existing entry with the same participantId to avoid duplicates and move it to the top.
            const filteredHistory = prevHistory.filter(item => item.participantId !== newItem.participantId);
            
            const entry: HistoryEntry = {
                ...newItem,
                id: `${Date.now()}-${newItem.participantId}`,
                timestamp: new Date()
            };
            
            // Add the new entry to the beginning of the array.
            const updatedHistory = [entry, ...filteredHistory];

            // Limit the history to a maximum number of items.
            return updatedHistory.slice(0, MAX_HISTORY_ITEMS);
        });
    };

    const clearHistory = () => {
        if (history.length > 0) {
            logService.warn('Search history cleared by user.');
        }
        setHistory([]);
    };

    const setHistoryFromBackup = (newHistory: HistoryEntry[]) => {
        // When restoring from backup, ensure timestamps are valid Date objects.
        const sanitizedHistory = newHistory.map(item => ({
            ...item,
            timestamp: new Date(item.timestamp),
        }));
        setHistory(sanitizedHistory);
    };

    return (
        <HistoryContext.Provider value={{ history, addHistoryItem, clearHistory, setHistory: setHistoryFromBackup }}>
            {children}
        </HistoryContext.Provider>
    );
};

export const useHistory = (): HistoryContextType => {
    const context = useContext(HistoryContext);
    if (context === undefined) {
        throw new Error('useHistory must be used within a HistoryProvider');
    }
    return context;
};
