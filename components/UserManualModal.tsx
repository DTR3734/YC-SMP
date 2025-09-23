import React from 'react';
import UserManualContent from './UserManualContent';
import { HelpCircleIcon } from './IconComponents';

interface UserManualModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const UserManualModal: React.FC<UserManualModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl m-4 max-w-4xl w-full max-h-[90vh] flex flex-col">
                <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                         <HelpCircleIcon className="w-6 h-6 text-blue-500" />
                        <h2 className="text-xl font-semibold">User Manual</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-2xl font-bold">&times;</button>
                </div>
                <div className="p-6 overflow-y-auto">
                    <UserManualContent />
                </div>
                 <div className="p-4 border-t dark:border-gray-700 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Close</button>
                </div>
            </div>
        </div>
    );
};

export default UserManualModal;
