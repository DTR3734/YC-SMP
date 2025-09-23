import React, { useState } from 'react';
import { useParticipants } from '../contexts/ParticipantContext';
// FIX: The ManagedParticipant type should be imported from the central types definition file.
import type { ManagedParticipant } from '../types';
import ParticipantEditorModal from './ParticipantEditorModal';
import ConfirmationModal from './ConfirmationModal';
import { TrashIcon } from './IconComponents';
import Tooltip from './Tooltip';

const SmpManagerView: React.FC = () => {
    const { participants, deleteParticipant } = useParticipants();
    const [isEditorOpen, setEditorOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedParticipant, setSelectedParticipant] = useState<ManagedParticipant | null>(null);

    const openEditorForNew = () => {
        setSelectedParticipant(null);
        setEditorOpen(true);
    };

    const openEditorForEdit = (participant: ManagedParticipant) => {
        setSelectedParticipant(participant);
        setEditorOpen(true);
    };
    
    const openDeleteModal = (participant: ManagedParticipant) => {
        setSelectedParticipant(participant);
        setDeleteModalOpen(true);
    };
    
    const handleDeleteConfirm = () => {
        if (selectedParticipant) {
            deleteParticipant(selectedParticipant.id);
        }
        setDeleteModalOpen(false);
        setSelectedParticipant(null);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">SMP Participant Manager</h1>
                <button
                    onClick={openEditorForNew}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    Add New Participant
                </button>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">PEPPOL ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Last Updated</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {participants.map(p => (
                            <tr key={p.id}>
                                <td className="px-6 py-4 whitespace-nowrap">{p.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap font-mono">{p.participantId}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${p.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {p.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{p.updatedAt.toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    <button onClick={() => openEditorForEdit(p)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                    <Tooltip text="Delete Participant">
                                        <button onClick={() => openDeleteModal(p)} className="text-red-600 hover:text-red-900"><TrashIcon className="w-5 h-5 inline" /></button>
                                    </Tooltip>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isEditorOpen && (
                <ParticipantEditorModal
                    participant={selectedParticipant}
                    onClose={() => setEditorOpen(false)}
                />
            )}
            
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                title="Delete Participant"
                message={`Are you sure you want to delete participant "${selectedParticipant?.name}"? This action cannot be undone.`}
                onConfirm={handleDeleteConfirm}
                onCancel={() => setDeleteModalOpen(false)}
                confirmText="Delete"
            />
        </div>
    );
};

export default SmpManagerView;