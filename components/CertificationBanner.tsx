import React from 'react';
import { InfoIcon } from './IconComponents';

const CertificationBanner: React.FC = () => {
    return (
        <div className="bg-yellow-100 dark:bg-yellow-800 border-b-2 border-yellow-300 dark:border-yellow-600 text-yellow-800 dark:text-yellow-100 p-2 text-center text-sm font-semibold z-10">
            <div className="flex items-center justify-center">
                <InfoIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                <span>CERTIFICATION MODE: Connected to PEPPOL Test Environment (SMK)</span>
            </div>
        </div>
    );
};

export default CertificationBanner;