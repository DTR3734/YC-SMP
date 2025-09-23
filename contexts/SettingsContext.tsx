import React, { createContext, useState, useContext, ReactNode } from 'react';
import type { Settings } from '../types';
import { logService } from '../services/logService';

export const SML_OPTIONS = [
    { label: 'PEPPOL Production SML', value: 'sml.peppol.eu.' },
    { label: 'PEPPOL Test (SMK)', value: 'smk.peppol.eu.' },
];

const DEFAULT_SETTINGS: Settings = {
    appMode: 'simulator',
    configMode: 'auto',
    sml: SML_OPTIONS[0].value,
    smpUrl: '',
    apUrl: '',
};

const PRODUCTION_LOCKED_SETTINGS: Settings = {
    appMode: 'production',
    configMode: 'auto',
    sml: SML_OPTIONS[0].value,
    smpUrl: '',
    apUrl: '',
};

interface SettingsContextType {
    settings: Settings;
    setSettings: (settings: Settings) => void;
    isProductionLocked: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isProductionLocked, setProductionLocked] = useState<boolean>(() => localStorage.getItem('peppol-smp-production-locked') === 'true');

    const [settings, setSettingsState] = useState<Settings>(() => {
        if (localStorage.getItem('peppol-smp-production-locked') === 'true') {
            return PRODUCTION_LOCKED_SETTINGS;
        }
        try {
            const storedSettings = localStorage.getItem('peppol-smp-settings');
            if (storedSettings) {
                const parsed = JSON.parse(storedSettings);
                if (parsed.appMode && parsed.configMode) {
                   return { ...DEFAULT_SETTINGS, ...parsed };
                }
            }
        } catch (error) {
            console.error('Failed to parse settings from localStorage', error);
            logService.error(`Failed to parse settings from localStorage: ${error instanceof Error ? error.message : String(error)}`);
        }
        return DEFAULT_SETTINGS;
    });

    const setSettings = (newSettings: Settings) => {
        if (isProductionLocked) {
            console.warn("Attempted to change settings while in locked production mode.");
            return;
        }

        let finalSettings = { ...newSettings };

        // If switching to production, engage the lock and overwrite settings.
        if (finalSettings.appMode === 'production') {
            logService.warn('Application mode has been permanently set to Production.');
            localStorage.setItem('peppol-smp-production-locked', 'true');
            setProductionLocked(true);
            finalSettings = PRODUCTION_LOCKED_SETTINGS;
        } 
        // Apply auto-configuration logic for other modes.
        else if (finalSettings.configMode === 'auto') {
            let sml = SML_OPTIONS[0].value;
            if (finalSettings.appMode === 'certification') {
                sml = SML_OPTIONS[1].value;
            }
            // Only apply changes if the SML needs to be updated
            if (sml !== finalSettings.sml) {
                finalSettings.sml = sml;
                finalSettings.smpUrl = '';
                finalSettings.apUrl = '';
            }
        }
        
        setSettingsState(finalSettings);
        try {
            localStorage.setItem('peppol-smp-settings', JSON.stringify(finalSettings));
            // Don't log a generic update message if we just logged the production lock warning.
            if (finalSettings.appMode !== 'production') {
                logService.info('Application settings updated.');
            }
        } catch (error) {
            console.error('Failed to save settings to localStorage', error);
            logService.error(`Failed to save settings to localStorage: ${error instanceof Error ? error.message : String(error)}`);
        }
    };


    return (
        <SettingsContext.Provider value={{ settings, setSettings, isProductionLocked }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = (): SettingsContextType => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
