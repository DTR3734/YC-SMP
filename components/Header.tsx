import React from 'react';
import ThemeToggleButton from './ThemeToggleButton';
import { useSettings } from '../contexts/SettingsContext';
import { ShieldCheckIcon, SignalIcon } from './IconComponents';
import Tooltip from './Tooltip';
import { useAuth } from '../contexts/AuthContext';

const ProductionBadge: React.FC = () => (
    <Tooltip text="The application is connected to the live PEPPOL network.">
        <div className="flex items-center ml-3 px-2.5 py-1 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 text-xs font-bold rounded-full">
            <ShieldCheckIcon className="w-4 h-4 mr-1.5" />
            <span>PRODUCTION</span>
        </div>
    </Tooltip>
);

const ServerStatusIndicator: React.FC = () => {
    const { serverStatus } = useAuth();
    const isOnline = serverStatus === 'online';

    return (
        <Tooltip text={isOnline ? 'Server Connection: Online' : 'Server Connection: Offline'}>
            <div className="flex items-center">
                 <SignalIcon className={`w-5 h-5 transition-colors duration-300 ${isOnline ? 'text-green-500' : 'text-red-500'}`} />
            </div>
        </Tooltip>
    );
};

const Header: React.FC = () => {
    const { settings } = useSettings();
    
    return (
        <header className="bg-white dark:bg-gray-800 shadow-sm p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
                 <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
                    PEPPOL SMP Lookup
                </h1>
                {settings.appMode === 'production' && <ProductionBadge />}
            </div>
            <div className="flex items-center space-x-4">
                <ServerStatusIndicator />
                <ThemeToggleButton />
            </div>
        </header>
    );
};

export default Header;
