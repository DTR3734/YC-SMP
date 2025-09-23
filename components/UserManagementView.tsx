import React, { useState } from 'react';
import { useUsers } from '../contexts/UserContext';
import type { User } from '../types';
import ConfirmationModal from './ConfirmationModal';
import UserEditorModal from './UserEditorModal';
import { TrashIcon } from './IconComponents';
import Tooltip from './Tooltip';

const UserManagementView: React.FC = () => {
    const { users, deleteUser } = useUsers();
    const [isEditorOpen, setEditorOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const openEditorForNew = () => {
        setSelectedUser(null);
        setEditorOpen(true);
    };

    const openEditorForEdit = (user: User) => {
        setSelectedUser(user);
        setEditorOpen(true);
    };

    const openDeleteModal = (user: User) => {
        setSelectedUser(user);
        setDeleteModalOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (selectedUser) {
            deleteUser(selectedUser.id);
        }
        setDeleteModalOpen(false);
        setSelectedUser(null);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">User Management</h1>
                <button
                    onClick={openEditorForNew}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    Add New User
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Username</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Created At</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {users.map(user => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap font-medium">{user.username}</td>
                                <td className="px-6 py-4 whitespace-nowrap capitalize">{user.role}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{user.createdAt.toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    <button onClick={() => openEditorForEdit(user)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                    <Tooltip text="Delete User">
                                        <button onClick={() => openDeleteModal(user)} className="text-red-600 hover:text-red-900"><TrashIcon className="w-5 h-5 inline" /></button>
                                    </Tooltip>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isEditorOpen && (
                <UserEditorModal
                    user={selectedUser}
                    onClose={() => setEditorOpen(false)}
                />
            )}

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                title="Delete User"
                message={`Are you sure you want to delete user "${selectedUser?.username}"? This action cannot be undone.`}
                onConfirm={handleDeleteConfirm}
                onCancel={() => setDeleteModalOpen(false)}
                confirmText="Delete"
            />
        </div>
    );
};

export default UserManagementView;