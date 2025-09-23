import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { logService } from '../services/logService';
import type { LogEntry } from '../types';
import ConfirmationModal from './ConfirmationModal';
import { TrashIcon, ExportIcon, ImportIcon } from './IconComponents';
import Tooltip from './Tooltip';

const LogViewer: React.FC = () => {
    const [logs, setLogs] = useState<LogEntry[]>(logService.get());
    const [isClearModalOpen, setClearModalOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const unsubscribe = logService.subscribe(setLogs);
        return () => unsubscribe();
    }, []);

    const getLogLevelClass = (level: string) => {
        switch (level) {
            case 'ERROR': return 'text-red-500';
            case 'WARN': return 'text-yellow-500';
            case 'INFO':
            default: return 'text-blue-500';
        }
    };
    
    const handleExport = () => {
        const dataStr = JSON.stringify(logs, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const link = document.createElement('a');
        link.href = dataUri;
        link.download = `peppol-smp-app-logs-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
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
                    const logs = JSON.parse(e.target?.result as string);
                    if (Array.isArray(logs)) {
                        logService.set(logs);
                    }
                } catch (error) {
                    alert('Failed to parse log file.');
                }
            };
            reader.readAsText(file);
        }
    };

    return (
        <div className="mt-8 p-4 border rounded-md dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">System Logs</h2>
                <div className="flex space-x-2">
                    <Tooltip text="Clear Logs">
                        <button onClick={() => setClearModalOpen(true)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-gray-700 rounded-full"><TrashIcon /></button>
                    </Tooltip>
                    <Tooltip text="Export Logs">
                        <button onClick={handleExport} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"><ExportIcon /></button>
                    </Tooltip>
                    <Tooltip text="Import Logs">
                         <button onClick={handleImportClick} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"><ImportIcon /></button>
                    </Tooltip>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".json" />
                </div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-900 rounded h-64 overflow-y-auto p-2 font-mono text-sm">
                {logs.length === 0 ? <p className="text-gray-500">No log entries.</p> :
                logs.slice().reverse().map((log, index) => (
                    <div key={index} className="flex">
                        <span className="text-gray-500 mr-2">{log.timestamp.toLocaleTimeString()}</span>
                        <span className={`font-bold mr-2 ${getLogLevelClass(log.level)}`}>{log.level}</span>
                        <span>{log.message}</span>
                    </div>
                ))}
            </div>
             <ConfirmationModal 
                isOpen={isClearModalOpen}
                title="Clear Logs"
                message="Are you sure you want to permanently delete all log entries?"
                onConfirm={() => { logService.clear(); setClearModalOpen(false); }}
                onCancel={() => setClearModalOpen(false)}
                confirmText="Clear"
            />
        </div>
    );
};

const ChangePasswordForm: React.FC = () => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const { changePassword, currentUser } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        if (newPassword !== confirmPassword) {
            setMessage('New passwords do not match.');
            setIsError(true);
            return;
        }
        const result = await changePassword(oldPassword, newPassword);
        setMessage(result.message);
        setIsError(!result.success);
        if (result.success) {
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        }
    };

    return (
        <div className="p-4 border rounded-md dark:border-gray-700">
             <h2 className="text-xl font-bold mb-4">Change Password for {currentUser?.username}</h2>
             <form onSubmit={handleSubmit} className="space-y-4">
                 <div>
                     <label className="block">Current Password</label>
                     <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} className="w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" required />
                 </div>
                 <div>
                     <label className="block">New Password</label>
                     <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" required />
                 </div>
                 <div>
                     <label className="block">Confirm New Password</label>
                     <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" required />
                 </div>
                 {message && <p className={isError ? 'text-red-500' : 'text-green-500'}>{message}</p>}
                 <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Update Password</button>
             </form>
        </div>
    );
};

const AdminView: React.FC = () => {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>
            <div className="space-y-6">
                <ChangePasswordForm />
                <LogViewer />
            </div>
        </div>
    );
};

export default AdminView;