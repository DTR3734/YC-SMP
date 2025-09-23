import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../services/api';
import type { ManagedParticipant } from '../types';
import { useAuth } from './AuthContext';

interface ParticipantContextType {
    participants: ManagedParticipant[];
    addParticipant: (participant: Omit<ManagedParticipant, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updateParticipant: (participant: ManagedParticipant) => Promise<void>;
    deleteParticipant: (id: string) => Promise<void>;
}

const ParticipantContext = createContext<ParticipantContextType | undefined>(undefined);

export const ParticipantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [participants, setParticipants] = useState<ManagedParticipant[]>([]);
    const { serverStatus } = useAuth();
    
    const refreshParticipants = useCallback(async () => {
        if (serverStatus !== 'online') {
            setParticipants([]); // Clear data if server is not online
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/api/participants`);
            if (!response.ok) {
                const errorBody = await response.text().catch(() => "Could not read error body.");
                throw new Error(`Failed to fetch participants: Server responded with ${response.status}. ${errorBody}`);
            }
            const data = await response.json();
            // Convert date strings to Date objects
            const typedData = data.map((p: any) => ({
                ...p,
                createdAt: new Date(p.createdAt),
                updatedAt: new Date(p.updatedAt),
            }));
            setParticipants(typedData);
        } catch (error) {
            console.error("Failed to fetch participants", error);
            setParticipants([]); // Clear data on error to avoid showing stale info
        }
    }, [serverStatus]);

    useEffect(() => {
        refreshParticipants();
    }, [refreshParticipants]);

    const addParticipant = async (participant: Omit<ManagedParticipant, 'id' | 'createdAt' | 'updatedAt'>) => {
        if (serverStatus !== 'online') return;
        await fetch(`${API_BASE_URL}/api/participants`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(participant),
        });
        await refreshParticipants();
    };

    const updateParticipant = async (updatedParticipant: ManagedParticipant) => {
        if (serverStatus !== 'online') return;
        await fetch(`${API_BASE_URL}/api/participants/${updatedParticipant.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedParticipant),
        });
        await refreshParticipants();
    };

    const deleteParticipant = async (id: string) => {
        if (serverStatus !== 'online') return;
        await fetch(`${API_BASE_URL}/api/participants/${id}`, { method: 'DELETE' });
        await refreshParticipants();
    };

    return (
        <ParticipantContext.Provider value={{ participants, addParticipant, updateParticipant, deleteParticipant }}>
            {children}
        </ParticipantContext.Provider>
    );
};

export const useParticipants = (): ParticipantContextType => {
    const context = useContext(ParticipantContext);
    if (context === undefined) {
        throw new Error('useParticipants must be used within a ParticipantProvider');
    }
    return context;
};