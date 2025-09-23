// FIX: Replaced circular import with the definition of LogLevel.
export type LogLevel = 'INFO' | 'WARN' | 'ERROR';

export type UserRole = 'admin' | 'manager' | 'viewer';

export interface User {
    id: string;
    username: string;
    password?: string; // Password should be handled securely, optional on read
    role: UserRole;
    createdAt: Date;
}

export interface LogEntry {
    timestamp: Date;
    level: LogLevel;
    message: string;
}

export interface HistoryEntry {
    id: string;
    participantId: string;
    timestamp: Date;
}

export type AppMode = 'simulator' | 'certification' | 'production';
export type ConfigMode = 'auto' | 'manual';

export interface Settings {
    appMode: AppMode;
    configMode: ConfigMode;
    sml: string;
    smpUrl: string;
    apUrl: string;
}

export interface PeppolDocumentIdentifier {
    scheme: string;
    value: string;
}

export interface PeppolProcessIdentifier {
    scheme: string;
    value: string;
}

export type CertificateStatus = 'valid' | 'expiring_soon' | 'expired' | 'invalid_format';

export interface PeppolEndpoint {
    transportProfile: string;
    endpointReference: string;
    requireBusinessLevelSignature: boolean;
    certificateDetails: string;
}

export interface PeppolProcess {
    processIdentifier: PeppolProcessIdentifier;
    serviceEndpointList: PeppolEndpoint[];
}

export interface PeppolServiceGroup {
    documentIdentifier: PeppolDocumentIdentifier;
    processes: PeppolProcess[];
}

export type EndpointHealthStatus = 'pending' | 'online' | 'offline';

export interface ManagedParticipant {
    id: string;
    participantId: string;
    name: string;
    smpIdentifier: string;
    status: 'active' | 'inactive';
    createdAt: Date;
    updatedAt: Date;
}