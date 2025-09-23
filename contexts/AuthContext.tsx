import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import type { User } from '../types';
import { API_BASE_URL } from '../services/api';

type ServerStatus = 'pending' | 'online' | 'offline';

interface AuthContextType {
    isAuthenticated: boolean;
    currentUser: User | null;
    serverStatus: ServerStatus;
    retryConnection: () => void;
    login: (user: string, pass: string) => Promise<boolean>;
    logout: () => void;
    changePassword: (oldPass: string, newPass: string) => Promise<{ success: boolean; message: string; }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [serverStatus, setServerStatus] = useState<ServerStatus>('pending');

    const isAuthenticated = !!currentUser;
    
    const checkServerStatus = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/health`);
            setServerStatus(response.ok ? 'online' : 'offline');
        } catch (error) {
            console.error("Server health check failed:", error);
            setServerStatus('offline');
        }
    }, []);

    useEffect(() => {
        setServerStatus('pending'); // Set pending only on initial mount
        checkServerStatus(); // Initial check
        const intervalId = setInterval(checkServerStatus, 30000); // Poll every 30 seconds

        return () => clearInterval(intervalId);
    }, [checkServerStatus]);


    const login = async (username: string, pass: string): Promise<boolean> => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password: pass }),
            });
            const data = await response.json();
            if (response.ok && data.success) {
                setCurrentUser(data.user);
                return true;
            } else {
                setCurrentUser(null);
                return false;
            }
        } catch (error) {
            console.error("Login failed:", error);
            setCurrentUser(null);
            return false;
        }
    };

    const logout = () => {
        setCurrentUser(null);
    };

    const changePassword = async (oldPass: string, newPass: string): Promise<{ success: boolean; message: string; }> => {
        if (!currentUser) {
            return { success: false, message: 'No user is logged in.' };
        }
        try {
             const response = await fetch(`${API_BASE_URL}/api/users/${currentUser.id}/password`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ oldPassword: oldPass, newPassword: newPass }),
            });
            const data = await response.json();
            return data;
        } catch (error) {
             console.error("Change password failed:", error);
             return { success: false, message: 'An unexpected error occurred.' };
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, currentUser, serverStatus, retryConnection: checkServerStatus, login, logout, changePassword }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};