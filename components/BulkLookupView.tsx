import React, { useState } from 'react';
import { lookupParticipant } from '../services/peppolService';
import type { PeppolServiceGroup } from '../types';
import { ExportIcon, SearchIcon, TrashIcon } from './IconComponents';
import LoadingSpinner from './LoadingSpinner';
import { ApiError, InvalidParticipantIdError, TimeoutError } from '../utils/errors';
import { useSettings } from '../contexts/SettingsContext';

interface BulkResult {
    participantId: string;
    status: 'success' | 'error' | 'not-found';
    data?: PeppolServiceGroup[];
    error?: string;
}

const BulkLookupView: React.FC = () => {
    const [participantIds, setParticipantIds] = useState('');
    const [results, setResults] = useState<BulkResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { settings } = useSettings();

    const handleLookup = async () => {
        const ids = participantIds.split('\n').map(id => id.trim()).filter(id => id);
        if (ids.length === 0) return;

        setIsLoading(true);
        setResults([]);

        const promises = ids.map(async (id): Promise<BulkResult> => {
            try {
                const data = await lookupParticipant(id, settings);
                if (data.length > 0) {
                    return { participantId: id, status: 'success', data };
                }
                return { participantId: id, status: 'not-found' };
            } catch (err) {
                let message: string;
                if (err instanceof InvalidParticipantIdError || err instanceof TimeoutError || err instanceof ApiError) {
                    message = err.message;
                } else if (err instanceof Error) {
                    message = 'An unexpected error occurred.';
                } else {
                    message = 'An unknown error occurred.';
                }
                return { participantId: id, status: 'error', error: message };
            }
        });

        const settledResults = await Promise.all(promises);
        setResults(settledResults);
        setIsLoading(false);
    };

    const handleExport = () => {
        const dataStr = JSON.stringify(results, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const link = document.createElement('a');
        link.href = dataUri;
        link.download = `peppol-bulk-lookup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Bulk PEPPOL Lookup</h1>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <label htmlFor="participant-ids" className="block text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Participant IDs
                </label>
                <textarea
                    id="participant-ids"
                    rows={8}
                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 font-mono"
                    placeholder="Enter one participant ID per line, e.g.,&#10;iso6523-actorid-upis::0088:1234567890123"
                    value={participantIds}
                    onChange={(e) => setParticipantIds(e.target.value)}
                    disabled={isLoading}
                />
                <div className="flex items-center space-x-4 mt-4">
                     <button
                        onClick={handleLookup}
                        disabled={isLoading || !participantIds.trim()}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                    >
                        <SearchIcon className="w-5 h-5 mr-2" />
                        {isLoading ? 'Looking up...' : 'Start Lookup'}
                    </button>
                    <button
                        onClick={() => setParticipantIds('')}
                        disabled={isLoading}
                        className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                    >
                        <TrashIcon className="w-5 h-5 mr-2" />
                        Clear
                    </button>
                </div>
            </div>

            {isLoading && <LoadingSpinner text="Performing bulk lookup..." />}

            {results.length > 0 && !isLoading && (
                <div className="mt-6">
                     <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Results</h2>
                         <button
                            onClick={handleExport}
                            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                        >
                            <ExportIcon className="w-5 h-5 mr-2" />
                            Export Results
                        </button>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Participant ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {results.map(res => (
                                    <tr key={res.participantId}>
                                        <td className="px-6 py-4 whitespace-nowrap font-mono">{res.participantId}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {res.status === 'success' && <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Found</span>}
                                            {res.status === 'not-found' && <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Not Found</span>}
                                            {res.status === 'error' && <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Error</span>}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            {res.status === 'success' && `${res.data?.length} service group(s) found.`}
                                            {res.status === 'error' && <span className="text-red-500">{res.error}</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BulkLookupView;