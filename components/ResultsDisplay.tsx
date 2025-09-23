import React, { useState } from 'react';
import type { PeppolServiceGroup } from '../types';
import ServiceCard from './ServiceCard';
import AiAssistantModal from './AiAssistantModal';
import { ExportIcon } from './IconComponents';

interface ResultsDisplayProps {
    results: PeppolServiceGroup[];
    participantId: string;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, participantId }) => {
    const [aiModalServiceGroup, setAiModalServiceGroup] = useState<PeppolServiceGroup | null>(null);

    const handleExport = () => {
        const dataStr = JSON.stringify({ participantId, results }, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `${participantId}_peppol_lookup.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };
    
    const handleAskAi = (serviceGroup: PeppolServiceGroup) => {
        setAiModalServiceGroup(serviceGroup);
    };

    const handleCloseAiModal = () => {
        setAiModalServiceGroup(null);
    };

    if (results.length === 0) {
        return (
            <div className="mt-6 text-center">
                <h2 className="text-xl font-semibold">No Results Found</h2>
                <p className="text-gray-600 dark:text-gray-400">
                    No PEPPOL capabilities found for participant <span className="font-mono bg-gray-200 dark:bg-gray-700 p-1 rounded">{participantId}</span>.
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="mt-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">
                        PEPPOL Capabilities for <span className="font-mono text-blue-600 dark:text-blue-400">{participantId}</span>
                    </h2>
                    <button 
                        onClick={handleExport}
                        className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                    >
                        <ExportIcon className="w-5 h-5 mr-2"/>
                        Export to JSON
                    </button>
                </div>
                <div className="space-y-6">
                    {results.map((serviceGroup, index) => (
                        <ServiceCard key={index} serviceGroup={serviceGroup} onAskAi={handleAskAi} />
                    ))}
                </div>
            </div>
            <AiAssistantModal
                isOpen={!!aiModalServiceGroup}
                onClose={handleCloseAiModal}
                serviceGroup={aiModalServiceGroup}
            />
        </>
    );
};

export default ResultsDisplay;
