import type { PeppolServiceGroup, Settings } from '../types';
import { ApiError, InvalidParticipantIdError, TimeoutError } from '../utils/errors';
import { API_BASE_URL } from './api';

/**
 * Performs a PEPPOL SMP lookup by calling the backend API.
 * @param participantId The PEPPOL participant identifier.
 * @param settings The current application settings.
 * @returns A promise that resolves with an array of service groups or rejects with an error.
 */
export const lookupParticipant = async (participantId: string, settings: Settings): Promise<PeppolServiceGroup[]> => {
    const response = await fetch(`${API_BASE_URL}/api/lookup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ participantId, settings }),
    });

    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ error: 'Failed to parse error response.' }));
        const errorMessage = errorBody.error || `Request failed with status ${response.status}`;

        if (response.status === 400) {
            throw new InvalidParticipantIdError(errorMessage);
        }
        if (response.status === 504) {
            throw new TimeoutError(errorMessage);
        }
        if (response.status >= 500) {
             throw new ApiError(errorMessage);
        }
        throw new ApiError(`An unexpected network error occurred: ${response.statusText}`);
    }

    return response.json();
};
