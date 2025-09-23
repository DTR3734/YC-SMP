import React, { useState, useEffect } from 'react';
import { useUsers } from '../contexts/UserContext';
import type { User, UserRole } from '../types';

interface UserEditorModalProps {
    user: User | null;
    onClose: () => void;
}

const UserEditorModal: React.FC<UserEditorModalProps> = ({ user, onClose }) => {
    const { addUser, updateUser } = useUsers();
    const [formData, setFormData] = useState({
        username: '',
        role: 'viewer' as UserRole,
        password: '',
        confirmPassword: '',
    });

    const isEditing = !!user;

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username,
                role: user.role,
                password: '',
                confirmPassword: '',
            });
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert('Passwords do not match.');
            return;
        }
        if (!isEditing && !formData.password) {
            alert('Password is required for a new user.');
            return;
        }

        if (isEditing) {
            const updatedUserData: User = {
                ...user,
                username: formData.username,
                role: formData.role,
            };
            if (formData.password) {
                updatedUserData.password = formData.password;
            }
            updateUser(updatedUserData);
        } else {
            addUser({
                username: formData.username,
                role: formData.role,
                password: formData.password,
            });
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl m-4 max-w-lg w-full">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h2 className="text-xl font-semibold mb-4">{isEditing ? 'Edit' : 'Add'} User</h2>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium">Username</label>
                                <input type="text" name="username" id="username" value={formData.username} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" required />
                            </div>
                            <div>
                                <label htmlFor="role" className="block text-sm font-medium">Role</label>
                                <select name="role" id="role" value={formData.role} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                                    <option value="viewer">Viewer</option>
                                    <option value="manager">Manager</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                             <div>
                                <label htmlFor="password" className="block text-sm font-medium">Password</label>
                                <input type="password" name="password" id="password" value={formData.password} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" placeholder={isEditing ? 'Leave blank to keep current' : ''} required={!isEditing} />
                            </div>
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium">Confirm Password</label>
                                <input type="password" name="confirmPassword" id="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
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

export default UserEditorModal;