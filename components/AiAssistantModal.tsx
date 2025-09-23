import React, { useState, useEffect } from 'react';
import type { PeppolServiceGroup } from '../types';
import { getDocumentTitle } from '../utils/peppolUtils.shared';
import { fetchAiExplanation, type AiExplanation } from '../services/aiService';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import { logService } from '../services/logService';

interface AiAssistantModalProps {
    isOpen: boolean;
    onClose: () => void;
    serviceGroup: PeppolServiceGroup | null;
}

const CodeBlock: React.FC<{ code: string }> = ({ code }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative bg-gray-100 dark:bg-gray-900 rounded-md">
            <button
                onClick={handleCopy}
                className="absolute top-2 right-2 px-2 py-1 text-xs bg-gray-300 dark:bg-gray-600 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
            >
                {copied ? 'Copied!' : 'Copy'}
            </button>
            <pre className="p-4 text-sm font-mono overflow-x-auto whitespace-pre-wrap">
                <code>{code}</code>
            </pre>
        </div>
    );
};

const AiAssistantModal: React.FC<AiAssistantModalProps> = ({ isOpen, onClose, serviceGroup }) => {
    const [data, setData] = useState<AiExplanation | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && serviceGroup) {
            const getExplanation = async () => {
                setIsLoading(true);
                setError(null);
                setData(null);
                logService.info(`Requesting AI explanation for ${serviceGroup.documentIdentifier.value}`);
                try {
                    const result = await fetchAiExplanation(serviceGroup);
                    setData(result);
                    logService.info(`Successfully received AI explanation.`);
                } catch (err: any) {
                    setError(err.message || 'Failed to get explanation from AI assistant.');
                    logService.error(`AI explanation failed: ${err.message}`);
                } finally {
                    setIsLoading(false);
                }
            };
            getExplanation();
        }
    }, [isOpen, serviceGroup]);

    if (!isOpen) return null;

    const documentTitle = serviceGroup ? getDocumentTitle(serviceGroup.documentIdentifier.value) : '';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl m-4 max-w-4xl w-full max-h-[90vh] flex flex-col">
                <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-semibold">AI Assistant for: {documentTitle}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-2xl font-bold">&times;</button>
                </div>
                <div className="p-6 overflow-y-auto">
                    {isLoading && <LoadingSpinner text="AI assistant is thinking..." />}
                    {error && <ErrorMessage message={error} />}
                    {data && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-bold mb-2">Explanation</h3>
                                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{data.explanation}</p>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold mb-2">Example XML Payload</h3>
                                <CodeBlock code={data.examplePayload} />
                            </div>
                        </div>
                    )}
                </div>
                <div className="p-4 border-t dark:border-gray-700 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Close</button>
                </div>
            </div>
        </div>
    );
};

export default AiAssistantModal;