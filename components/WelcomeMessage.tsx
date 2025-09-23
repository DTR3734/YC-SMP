import React from 'react';
import { SearchIcon } from './IconComponents';

const WelcomeMessage: React.FC = () => {
    return (
        <div className="text-center p-8 mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="flex justify-center items-center mb-4">
                <SearchIcon className="w-16 h-16 text-gray-300 dark:text-gray-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                Welcome to the PEPPOL SMP Lookup Application
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
                Enter a PEPPOL Participant ID above to find its service metadata.
            </p>
        </div>
    );
};

export default WelcomeMessage;