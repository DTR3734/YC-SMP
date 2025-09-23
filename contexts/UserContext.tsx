import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import type { User } from '../types';
import { API_BASE_URL } from '../services/api';
import { useAuth } from './AuthContext';

interface UserContextType {
    users: User[];
    addUser: (user: Omit<User, 'id' | 'createdAt'>) => Promise<void>;
    updateUser: (user: User) => Promise<void>;
    deleteUser: (id: string) => Promise<void>;
    findUserByUsername: (username: string) => User | undefined;
    refreshUsers: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [users, setUsers] = useState<User[]>([]);
    const { serverStatus } = useAuth();

    const refreshUsers = useCallback(async () => {
        if (serverStatus !== 'online') {
            setUsers([]); // Clear data if server is not online
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/api/users`);
            if (!response.ok) {
                const errorBody = await response.text().catch(() => "Could not read error body.");
                throw new Error(`Failed to fetch users: Server responded with ${response.status}. ${errorBody}`);
            }
            const data = await response.json();
            // The API sends date strings. We must convert them to Date objects to match the `User` type.
            const typedData = data.map((u: any) => ({
                ...u,
                createdAt: new Date(u.createdAt),
            }));
            setUsers(typedData);
        } catch (error) {
            console.error("Failed to fetch users:", error);
            setUsers([]); // Clear stale data on error
        }
    }, [serverStatus]);

    useEffect(() => {
        refreshUsers();
    }, [refreshUsers]);

    const addUser = async (userData: Omit<User, 'id' | 'createdAt'>) => {
        if (serverStatus !== 'online') return;
        await fetch(`${API_BASE_URL}/api/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });
        await refreshUsers();
    };

    const updateUser = async (updatedUser: User) => {
        if (serverStatus !== 'online') return;
        await fetch(`${API_BASE_URL}/api/users/${updatedUser.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedUser),
        });
        await refreshUsers();
    };

    const deleteUser = async (id: string) => {
        if (serverStatus !== 'online') return;
        await fetch(`${API_BASE_URL}/api/users/${id}`, { method: 'DELETE' });
        await refreshUsers();
    };

    const findUserByUsername = (username: string): User | undefined => {
        return users.find(u => u.username === username);
    };

    return (
        <UserContext.Provider value={{ users, addUser, updateUser, deleteUser, findUserByUsername, refreshUsers }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUsers = (): UserContextType => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUsers must be used within a UserProvider');
    }
    return context;
};