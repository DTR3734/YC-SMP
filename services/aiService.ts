import type { PeppolServiceGroup } from '../types';
import { ApiError } from '../utils/errors';
import { API_BASE_URL } from './api';

export interface AiExplanation {
    explanation: string;
    examplePayload: string;
}

export const fetchAiExplanation = async (serviceGroup: PeppolServiceGroup): Promise<AiExplanation> => {
    const response = await fetch(`${API_BASE_URL}/api/ai/explain`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ serviceGroup }),
    });

    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ error: 'Failed to parse error response.' }));
        const errorMessage = errorBody.error || `Request failed with status ${response.status}`;
        throw new ApiError(errorMessage);
    }

    return response.json();
};
