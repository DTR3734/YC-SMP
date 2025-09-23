import React from 'react';
import { PeppolLogo } from './IconComponents';

const AboutView: React.FC = () => {
    const buildInfo = '__BUILD_INFO__'; // This can be replaced by a build script

    return (
        <div className="flex justify-center items-start pt-10">
            <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
                <div className="flex justify-center items-center mb-6">
                    <PeppolLogo className="w-20 h-20 text-blue-600 dark:text-blue-400" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    PEPPOL SMP Lookup
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                    A professional tool for querying the PEPPOL eDelivery Network.
                </p>

                <div className="text-left bg-gray-50 dark:bg-gray-700 p-6 rounded-lg space-y-3">
                    <div className="flex justify-between">
                        <span className="font-semibold text-gray-700 dark:text-gray-300">Version:</span>
                        <span className="font-mono text-gray-800 dark:text-gray-200">1.0</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="font-semibold text-gray-700 dark:text-gray-300">Build:</span>
                        <span className="font-mono text-gray-800 dark:text-gray-200">{buildInfo}</span>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 space-y-1">
                    <p>Copyright © 2025 YouCloud DMCC. All rights reserved.</p>
                    <p>
                        Released under the <a href="https://opensource.org/licenses/MIT" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">MIT License</a>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AboutView;
