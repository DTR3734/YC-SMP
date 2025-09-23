import React, { useRef, useState, useEffect } from 'react';
import { useSettings, SML_OPTIONS } from '../contexts/SettingsContext';
import { useHistory } from '../contexts/HistoryContext';
import { logService } from '../services/logService';
import type { Settings } from '../types';
import { ExportIcon, ImportIcon } from './IconComponents';
import ConfirmationModal from './ConfirmationModal';

interface SettingsViewProps {
    onClose: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ onClose }) => {
    const { settings, setSettings } = useSettings();
    const { history, setHistory } = useHistory();
    
    const [localSettings, setLocalSettings] = useState<Settings>(settings);
    const [isImportConfirmOpen, setImportConfirmOpen] = useState(false);
    const [isProductionConfirmOpen, setProductionConfirmOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [importedData, setImportedData] = useState<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Reset local state if the modal is reopened with different global settings
        setLocalSettings(settings);
    }, [settings]);

    // Keep local SML in sync when in auto mode
    useEffect(() => {
        if (localSettings.configMode === 'auto') {
            let sml = SML_OPTIONS[0].value; // Production
            if (localSettings.appMode === 'certification') {
                sml = SML_OPTIONS[1].value; // Test
            }
            if (sml !== localSettings.sml) {
                setLocalSettings(prev => ({ ...prev, sml }));
            }
        }
    }, [localSettings.appMode, localSettings.configMode, localSettings.sml]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === 'appMode' && value === 'production' && localSettings.appMode !== 'production') {
            setProductionConfirmOpen(true);
            return; // Defer state change until confirmed
        }
        
        setLocalSettings(prev => ({ ...prev, [name]: value } as Settings));
    };

    const handleSmlSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { value } = e.target;
        if (value === 'custom') {
            setLocalSettings(prev => ({ ...prev, sml: '' })); // Clear SML to prompt for custom input
        } else {
            setLocalSettings(prev => ({ ...prev, sml: value }));
        }
    };
    
    const handleConfirmProductionSwitch = () => {
        setLocalSettings(prev => ({ ...prev, appMode: 'production' }));
        setProductionConfirmOpen(false);
    };
    
    const handleSave = () => {
        setIsSaving(true);
        // Simulate a short delay to give user feedback, even if saving is fast
        setTimeout(() => {
            setSettings(localSettings);
            // The log will be written by the context, so we don't duplicate it here.
            setIsSaving(false);
            onClose();
        }, 500);
    };

    const handleExport = () => {
        const data = {
            settings: settings, // Export saved settings, not local ones
            history: history,
            logs: logService.get(),
        };
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = `peppol-smp-app-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        logService.info('Application data exported.');
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const text = e.target?.result;
                    if (typeof text === 'string') {
                        const data = JSON.parse(text);
                        if (data.settings && data.history && data.logs) {
                           setImportedData(data);
                           setImportConfirmOpen(true);
                        } else {
                            alert('Invalid backup file format.');
                        }
                    }
                } catch (error) {
                    alert('Error reading or parsing the backup file.');
                    logService.error('Failed to import data: ' + (error as Error).message);
                }
            };
            reader.readAsText(file);
        }
        if(fileInputRef.current) fileInputRef.current.value = '';
    };

    const confirmImport = () => {
        if (importedData) {
            setSettings(importedData.settings);
            setHistory(importedData.history);
            logService.set(importedData.logs);
            logService.warn('Application data restored from backup.');
        }
        setImportConfirmOpen(false);
        setImportedData(null);
        onClose(); // Close settings after import
    };
    
    const isPredefinedSml = SML_OPTIONS.some(opt => opt.value === localSettings.sml);
    const smlSelectValue = localSettings.configMode === 'auto' || isPredefinedSml ? localSettings.sml : 'custom';
    const showCustomSmlInput = localSettings.configMode === 'manual' && smlSelectValue === 'custom';

    return (
        <div>
            <div className="space-y-6">
                {/* Application and Configuration Mode Settings */}
                <div className="p-4 border rounded-md dark:border-gray-700">
                    <label htmlFor="appMode" className="block text-lg font-medium">Application Mode</label>
                    <select 
                        id="appMode" 
                        name="appMode" 
                        value={localSettings.appMode} 
                        onChange={handleChange} 
                        className="w-full mt-2 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={localSettings.appMode === 'production'}
                    >
                        <option value="simulator">Simulator</option>
                        <option value="certification">Certification (Test)</option>
                        <option value="production">Production</option>
                    </select>
                     {localSettings.appMode === 'production' && (
                        <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2">
                            The application is in Production mode. This setting cannot be changed.
                        </p>
                    )}
                </div>

                <div className="p-4 border rounded-md dark:border-gray-700">
                    <label className="block text-lg font-medium">Configuration Mode</label>
                     <div className="mt-2 flex space-x-4">
                        <label className="flex items-center">
                            <input type="radio" name="configMode" value="auto" checked={localSettings.configMode === 'auto'} onChange={handleChange} className="form-radio" disabled={localSettings.appMode === 'certification'} />
                            <span className="ml-2">Automatic</span>
                        </label>
                         <label className="flex items-center">
                            <input type="radio" name="configMode" value="manual" checked={localSettings.configMode === 'manual'} onChange={handleChange} className="form-radio" disabled={localSettings.appMode === 'certification'} />
                            <span className="ml-2">Manual</span>
                        </label>
                    </div>
                     {localSettings.appMode === 'certification' && (
                        <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                            Configuration is locked to Automatic mode when in Certification mode.
                        </p>
                    )}
                </div>

                 <div className="p-4 border rounded-md dark:border-gray-700 space-y-4">
                    <h3 className="text-lg font-medium">SML Configuration</h3>
                     <div>
                        <label htmlFor="sml" className="block font-medium">SML Server</label>
                        <select
                            id="sml"
                            name="sml"
                            value={smlSelectValue}
                            onChange={handleSmlSelectChange}
                            className="w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50"
                            disabled={localSettings.configMode === 'auto' || localSettings.appMode === 'certification'}
                        >
                            {SML_OPTIONS.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                            <option value="custom">Custom...</option>
                        </select>
                     </div>
                     {showCustomSmlInput && (
                         <div>
                            <label htmlFor="customSml" className="block font-medium">Custom SML URL</label>
                             <input
                                type="text"
                                id="customSml"
                                name="sml" // This should also update the 'sml' field in state
                                value={localSettings.sml}
                                onChange={handleChange}
                                className="w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                                placeholder="e.g., sml.example.com"
                            />
                         </div>
                     )}
                 </div>

                {localSettings.configMode === 'manual' && (
                    <div className="p-4 border rounded-md dark:border-gray-700 space-y-4">
                        <h3 className="text-lg font-medium">Manual Overrides</h3>
                        <div>
                            <label htmlFor="smpUrl" className="block font-medium">SMP URL (Direct Lookup)</label>
                            <input type="text" id="smpUrl" name="smpUrl" value={localSettings.smpUrl} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" placeholder="e.g., https://smp.example.com (optional)" />
                        </div>
                        <div>
                            <label htmlFor="apUrl" className="block font-medium">AP URL</label>
                            <input type="text" id="apUrl" name="apUrl" value={localSettings.apUrl} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" placeholder="e.g., https://ap.example.com/as4 (optional)" />
                        </div>
                    </div>
                )}
                
                {/* Data Management */}
                <div className="p-4 border rounded-md dark:border-gray-700">
                    <h3 className="text-lg font-medium mb-4">Data Management</h3>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                         <button onClick={handleExport} className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                           <ExportIcon className="w-5 h-5 mr-2" /> Export Data
                        </button>
                         <button onClick={handleImportClick} className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
                            <ImportIcon className="w-5 h-5 mr-2" /> Import Data
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".json" />
                    </div>
                </div>
            </div>
            
            {/* Action Buttons */}
            <div className="mt-8 pt-6 border-t dark:border-gray-700 flex justify-end space-x-4">
                <button 
                    type="button" 
                    onClick={onClose} 
                    className="px-4 py-2 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                    disabled={isSaving}
                >
                    Cancel
                </button>
                <button 
                    type="button" 
                    onClick={handleSave} 
                    className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400"
                    disabled={isSaving}
                >
                    {isSaving ? 'Saving...' : 'Save Settings'}
                </button>
            </div>

            <ConfirmationModal
                isOpen={isImportConfirmOpen}
                title="Confirm Import"
                message="Are you sure you want to import this data? This will overwrite all current settings, search history, and logs."
                onConfirm={confirmImport}
                onCancel={() => setImportConfirmOpen(false)}
                confirmText="Import"
            />
            
            <ConfirmationModal
                isOpen={isProductionConfirmOpen}
                title="Confirm Switch to Production"
                message="You are about to switch to Production mode. This action is not easily reversible and will connect the application to the live PEPPOL network. Are you sure you want to proceed?"
                onConfirm={handleConfirmProductionSwitch}
                onCancel={() => setProductionConfirmOpen(false)}
                confirmText="Yes, switch to Production"
            />
        </div>
    );
};

export default SettingsView;