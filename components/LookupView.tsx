import React, { useState } from 'react';
import SearchForm from './SearchForm';
import ResultsDisplay from './ResultsDisplay';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import WelcomeMessage from './WelcomeMessage';
import type { PeppolServiceGroup } from '../types';
import { lookupParticipant } from '../services/peppolService';
import { useHistory } from '../contexts/HistoryContext';
import { useSettings } from '../contexts/SettingsContext';
import { ApiError, InvalidParticipantIdError, TimeoutError } from '../utils/errors';
import { logService } from '../services/logService';

const LookupView: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] = useState<PeppolServiceGroup[] | null>(null);
    const [participantId, setParticipantId] = useState('');
    const { addHistoryItem } = useHistory();
    const { settings } = useSettings();

    const handleSearch = async (id: string) => {
        setIsLoading(true);
        setError(null);
        setResults(null);
        setParticipantId(id);
        logService.info(`Starting lookup for participant: ${id}`);

        try {
            const data = await lookupParticipant(id, settings);
            setResults(data);
            if (data.length > 0) {
                logService.info(`Lookup successful for ${id}, found ${data.length} service groups.`);
            } else {
                 logService.info(`Lookup for ${id} completed, but no capabilities were found.`);
            }
            addHistoryItem({ participantId: id });
        } catch (err) {
            let errorMessage: string;
            if (err instanceof InvalidParticipantIdError || err instanceof TimeoutError || err instanceof ApiError) {
                errorMessage = err.message;
            } else if (err instanceof Error) {
                errorMessage = 'An unexpected error occurred. Please check the logs for more details.';
                 console.error(err);
            } else {
                errorMessage = 'An unknown error occurred.';
            }
            setError(errorMessage);
            logService.error(`Lookup failed for ${id}: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    const renderContent = () => {
        if (isLoading) {
            return <LoadingSpinner text={`Looking up ${participantId}...`} />;
        }
        if (error) {
            return <ErrorMessage message={error} />;
        }
        if (results !== null) {
            return <ResultsDisplay results={results} participantId={participantId} />;
        }
        return <WelcomeMessage />;
    };

    return (
        <div>
            <SearchForm onSearch={handleSearch} isLoading={isLoading} />
            <div className="mt-4">
                {renderContent()}
            </div>
        </div>
    );
};

export default LookupView;