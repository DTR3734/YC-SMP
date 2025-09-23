import React, { useState, useEffect } from 'react';
import { useParticipants } from '../contexts/ParticipantContext';
// FIX: The ManagedParticipant type should be imported from the central types definition file.
import type { ManagedParticipant } from '../types';

interface ParticipantEditorModalProps {
    participant: ManagedParticipant | null;
    onClose: () => void;
}

const ParticipantEditorModal: React.FC<ParticipantEditorModalProps> = ({ participant, onClose }) => {
    const { addParticipant, updateParticipant } = useParticipants();
    const [formData, setFormData] = useState({
        name: '',
        participantId: '',
        smpIdentifier: '',
        status: 'active' as 'active' | 'inactive',
    });

    useEffect(() => {
        if (participant) {
            setFormData({
                name: participant.name,
                participantId: participant.participantId,
                smpIdentifier: participant.smpIdentifier,
                status: participant.status,
            });
        }
    }, [participant]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (participant) {
            updateParticipant({ ...participant, ...formData });
        } else {
            addParticipant(formData);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl m-4 max-w-lg w-full">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h2 className="text-xl font-semibold mb-4">{participant ? 'Edit' : 'Add'} Participant</h2>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium">Name</label>
                                <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" required />
                            </div>
                            <div>
                                <label htmlFor="participantId" className="block text-sm font-medium">PEPPOL Participant ID</label>
                                <input type="text" name="participantId" id="participantId" value={formData.participantId} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 font-mono" placeholder="scheme::value" required />
                            </div>
                            <div>
                                <label htmlFor="smpIdentifier" className="block text-sm font-medium">SMP Identifier</label>
                                <input type="text" name="smpIdentifier" id="smpIdentifier" value={formData.smpIdentifier} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" placeholder="smp.example.com" />
                            </div>
                             <div>
                                <label htmlFor="status" className="block text-sm font-medium">Status</label>
                                <select name="status" id="status" value={formData.status} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="px-6 py-4 bg-gray-100 dark:bg-gray-700 rounded-b-lg flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ParticipantEditorModal;