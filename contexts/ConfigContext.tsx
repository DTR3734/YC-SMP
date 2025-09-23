
import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';

interface ConfigContextType {
    serverAddress: string;
    setServerAddress: (address: string) => void;
    isConfigured: boolean;
    checkServerStatus: () => Promise<void>;
    isServerOnline: boolean;
}

export const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [serverAddress, setServerAddressState] = useState<string>('');
    const [isConfigured, setIsConfigured] = useState<boolean>(false);
    const [isServerOnline, setIsServerOnline] = useState<boolean>(true);

    useEffect(() => {
        const savedAddress = localStorage.getItem('serverAddress');
        if (savedAddress) {
            setServerAddressState(savedAddress);
            setIsConfigured(true);
        } else {
            setIsConfigured(false);
        }
    }, []);

    const setServerAddress = (address: string) => {
        localStorage.setItem('serverAddress', address);
        setServerAddressState(address);
        setIsConfigured(true);
        setIsServerOnline(true); // Assume online when new address is set
    };
    
    const checkServerStatus = async () => {
        if (!isConfigured || !serverAddress) {
            setIsServerOnline(false);
            return;
        }
        try {
            const response = await fetch(`${serverAddress}/api/health`);
            if (response.ok) {
                setIsServerOnline(true);
            } else {
                setIsServerOnline(false);
            }
        } catch (error) {
            setIsServerOnline(false);
        }
    };

    useEffect(() => {
        if (isConfigured) {
            checkServerStatus();
        }
    }, [isConfigured, serverAddress]);


    return (
        <ConfigContext.Provider value={{ serverAddress, setServerAddress, isConfigured, checkServerStatus, isServerOnline }}>
            {children}
        </ConfigContext.Provider>
    );
};

export const useConfig = (): ConfigContextType => {
    const context = useContext(ConfigContext);
    if (!context) {
        throw new Error('useConfig must be used within a ConfigProvider');
    }
    return context;
};
