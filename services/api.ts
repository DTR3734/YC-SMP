
// services/api.ts

const getServerAddress = (): string => {
    const savedAddress = localStorage.getItem('serverAddress');
    // Default to the same origin if no address is saved, which is suitable for a unified server setup.
    return savedAddress || ''; 
};

export const getApiBaseUrl = (): string => {
    const serverAddress = getServerAddress();
    return `${serverAddress}/api`;
};
