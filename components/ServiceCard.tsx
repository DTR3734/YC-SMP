import React, { useState } from 'react';
import type { PeppolServiceGroup, PeppolEndpoint, EndpointHealthStatus, CertificateStatus } from '../types';
import { getDocumentTitle, getProcessTitle } from '../utils/peppolUtils.shared';
import { parseCertificateDates } from '../utils/dateUtils';
import { HealthCheckIcon, CheckCircleIcon, XCircleIcon, ClockIcon, SparklesIcon } from './IconComponents';
import LoadingSpinner from './LoadingSpinner';
import Tooltip from './Tooltip';

interface ServiceCardProps {
    serviceGroup: PeppolServiceGroup;
    onAskAi: (serviceGroup: PeppolServiceGroup) => void;
}

const CertificateStatusBadge: React.FC<{ status: CertificateStatus, validTo: Date | null }> = ({ status, validTo }) => {
    const statusStyles: Record<CertificateStatus, { text: string; bg: string; icon: React.ReactNode }> = {
        valid: { text: 'text-green-800 dark:text-green-200', bg: 'bg-green-100 dark:bg-green-800', icon: <CheckCircleIcon className="w-4 h-4 text-green-500" /> },
        expiring_soon: { text: 'text-yellow-800 dark:text-yellow-200', bg: 'bg-yellow-100 dark:bg-yellow-800', icon: <ClockIcon className="w-4 h-4 text-yellow-500" /> },
        expired: { text: 'text-red-800 dark:text-red-200', bg: 'bg-red-100 dark:bg-red-800', icon: <XCircleIcon className="w-4 h-4 text-red-500" /> },
        invalid_format: { text: 'text-gray-800 dark:text-gray-200', bg: 'bg-gray-200 dark:bg-gray-600', icon: null },
    };
    
    const statusTooltips: Record<CertificateStatus, string> = {
        valid: 'Certificate is valid.',
        expiring_soon: 'Certificate will expire within 30 days.',
        expired: 'Certificate has expired.',
        invalid_format: 'Could not parse certificate details from the text.',
    };

    const currentStyle = statusStyles[status];
    const text = status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());

    return (
        <Tooltip text={statusTooltips[status]}>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${currentStyle.bg} ${currentStyle.text}`}>
                {currentStyle.icon && <span className="mr-1.5">{currentStyle.icon}</span>}
                {text}
                {status !== 'invalid_format' && validTo && ` (until ${validTo.toLocaleDateString()})`}
            </span>
        </Tooltip>
    );
};

const EndpointHealthButton: React.FC<{ endpointUrl: string }> = ({ endpointUrl }) => {
    const [status, setStatus] = useState<EndpointHealthStatus>('pending');
    const [isLoading, setIsLoading] = useState(false);

    const checkHealth = async () => {
        setIsLoading(true);
        setStatus('pending');
        try {
            // NOTE: A real CORS HEAD/OPTIONS request might be blocked by browsers.
            // This is a simplified simulation of a health check.
            await new Promise(resolve => setTimeout(resolve, 1000));
            // Simulate success/failure based on URL for demonstration
            if (endpointUrl.includes('error')) {
                 throw new Error('Simulated network error');
            }
            setStatus('online');
        } catch (error) {
            setStatus('offline');
        } finally {
            setIsLoading(false);
        }
    };
    
    const StatusIcon = () => {
        switch (status) {
            case 'online': return <Tooltip text="Endpoint is online"><CheckCircleIcon className="w-5 h-5 text-green-500" /></Tooltip>;
            case 'offline': return <Tooltip text="Endpoint is offline or unreachable"><XCircleIcon className="w-5 h-5 text-red-500" /></Tooltip>;
            default: return null;
        }
    };

    return (
        <div className="flex items-center space-x-2">
            <button
                onClick={checkHealth}
                disabled={isLoading}
                className="flex items-center px-3 py-1 text-sm border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50"
            >
                {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500 mr-2"></div>
                ) : (
                    <HealthCheckIcon className="w-4 h-4 mr-2" />
                )}
                Test Endpoint
            </button>
            {status !== 'pending' && <StatusIcon />}
        </div>
    );
};

const EndpointDetails: React.FC<{ endpoint: PeppolEndpoint }> = ({ endpoint }) => {
    const certInfo = parseCertificateDates(endpoint.certificateDetails);

    return (
        <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-md">
            <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-gray-800 dark:text-gray-100">Endpoint Details</h4>
                <CertificateStatusBadge status={certInfo.status} validTo={certInfo.validTo} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div><strong>Transport:</strong> {endpoint.transportProfile}</div>
                <div><strong>Signature:</strong> {endpoint.requireBusinessLevelSignature ? 'Yes' : 'No'}</div>
                <div className="col-span-full flex items-center space-x-4">
                    <span><strong>URL:</strong> <span className="font-mono break-all">{endpoint.endpointReference}</span></span>
                    <EndpointHealthButton endpointUrl={endpoint.endpointReference} />
                </div>
            </div>
            <pre className="mt-4 p-3 bg-gray-200 dark:bg-gray-800 rounded text-xs overflow-x-auto">
                <code>{endpoint.certificateDetails}</code>
            </pre>
        </div>
    );
};

const ServiceCard: React.FC<ServiceCardProps> = ({ serviceGroup, onAskAi }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { documentIdentifier, processes } = serviceGroup;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-4 flex justify-between items-center">
                <button
                    className="flex-grow text-left focus:outline-none"
                    onClick={() => setIsExpanded(!isExpanded)}
                    aria-expanded={isExpanded}
                >
                    <h3 className="font-bold text-lg text-blue-700 dark:text-blue-400">
                        {getDocumentTitle(documentIdentifier.value)}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 font-mono">{documentIdentifier.value}</p>
                </button>
                <Tooltip text="Ask AI to explain and generate an example">
                    <button
                        onClick={() => onAskAi(serviceGroup)}
                        className="ml-4 p-2 rounded-full text-blue-500 hover:bg-blue-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                        <SparklesIcon className="w-6 h-6" />
                    </button>
                </Tooltip>
            </div>
            {isExpanded && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    {processes.map((process, pIndex) => (
                        <div key={pIndex} className="mb-4 last:mb-0">
                            <h4 className="font-semibold text-md">Process: <span className="font-mono text-sm text-gray-700 dark:text-gray-300">{getProcessTitle(process.processIdentifier.value)}</span></h4>
                            {process.serviceEndpointList.map((endpoint, eIndex) => (
                                <EndpointDetails key={eIndex} endpoint={endpoint} />
                            ))}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ServiceCard;