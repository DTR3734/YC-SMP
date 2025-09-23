import type { CertificateStatus } from '../types';

export const formatDistanceToNow = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) {
        return Math.floor(interval) + " years ago";
    }
    interval = seconds / 2592000;
    if (interval > 1) {
        return Math.floor(interval) + " months ago";
    }
    interval = seconds / 86400;
    if (interval > 1) {
        return Math.floor(interval) + " days ago";
    }
    interval = seconds / 3600;
    if (interval > 1) {
        return Math.floor(interval) + " hours ago";
    }
    interval = seconds / 60;
    if (interval > 1) {
        return Math.floor(interval) + " minutes ago";
    }
    return "just now";
};

export const parseCertificateDates = (
    certificateDetails: string
): { status: CertificateStatus; validTo: Date | null } => {
    const notAfterMatch = certificateDetails.match(/Not After\s*:\s*(.*)/);
    
    if (!notAfterMatch || !notAfterMatch[1]) {
        return { status: 'invalid_format', validTo: null };
    }

    try {
        const validTo = new Date(notAfterMatch[1].trim());
        if (isNaN(validTo.getTime())) {
             return { status: 'invalid_format', validTo: null };
        }
        
        const now = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(now.getDate() + 30);

        if (validTo < now) {
            return { status: 'expired', validTo };
        }
        if (validTo < thirtyDaysFromNow) {
            return { status: 'expiring_soon', validTo };
        }
        return { status: 'valid', validTo };
    } catch (error) {
        return { status: 'invalid_format', validTo: null };
    }
};
