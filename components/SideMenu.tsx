import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { SearchIcon, BulkIcon, AdminIcon, SettingsIcon, HistoryIcon, InfoIcon, UsersIcon, LogOutIcon } from './IconComponents';
import type { UserRole } from '../types';

interface SideMenuProps {
    activeView: string;
    setActiveView: (view: string) => void;
    openSettings: () => void;
    openHistory: () => void;
}

const ALL_MENU_ITEMS: Record<string, { id: string, label: string, icon: React.ReactNode, roles: UserRole[] }> = {
    lookup: { id: 'lookup', label: 'Single Lookup', icon: <SearchIcon className="w-6 h-6" />, roles: ['admin', 'manager', 'viewer'] },
    bulk: { id: 'bulk', label: 'Bulk Lookup', icon: <BulkIcon className="w-6 h-6" />, roles: ['admin', 'manager', 'viewer'] },
    'smp-manager': { id: 'smp-manager', label: 'SMP Manager', icon: <SettingsIcon className="w-6 h-6" />, roles: ['admin', 'manager'] },
    'user-management': { id: 'user-management', label: 'User Management', icon: <UsersIcon className="w-6 h-6" />, roles: ['admin'] },
    admin: { id: 'admin', label: 'Admin', icon: <AdminIcon className="w-6 h-6" />, roles: ['admin'] },
};


const SideMenu: React.FC<SideMenuProps> = ({ activeView, setActiveView, openSettings, openHistory }) => {
    const { currentUser, logout } = useAuth();
    const userRole = currentUser?.role;

    const menuItems = Object.values(ALL_MENU_ITEMS)
        .filter(item => userRole && item.roles.includes(userRole))
        .map(item => ({ ...item, action: () => setActiveView(item.id) }));
    
    const secondaryItems = [
        { id: 'history', label: 'History', icon: <HistoryIcon className="w-6 h-6" />, action: openHistory },
        { id: 'settings', label: 'Settings', icon: <SettingsIcon className="w-6 h-6" />, action: openSettings },
        { id: 'about', label: 'About', icon: <InfoIcon className="w-6 h-6" />, action: () => setActiveView('about') },
    ];

    const NavButton: React.FC<{ id: string, label: string, icon: React.ReactNode, action: () => void, isActive?: boolean }> = ({ id, label, icon, action, isActive }) => {
        return (
             <button
                onClick={action}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md text-left transition-colors duration-200 ${
                    isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
            >
                {icon}
                <span className="font-medium">{label}</span>
            </button>
        );
    };

    return (
        <aside className="w-64 bg-white dark:bg-gray-800 p-4 border-r border-gray-200 dark:border-gray-700 flex-shrink-0 flex flex-col">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-center text-blue-600 dark:text-blue-400">PEPPOL Lookup</h1>
            </div>
            <nav className="space-y-2 flex-grow">
                {menuItems.map(item => (
                    <NavButton key={item.id} {...item} isActive={activeView === item.id} />
                ))}
            </nav>
            <div className="space-y-2">
                 {secondaryItems.map(item => (
                    <NavButton key={item.id} {...item} isActive={activeView === item.id} />
                 ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                <div className="px-4 py-2">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate" title={currentUser?.username}>
                        {currentUser?.username}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                        {currentUser?.role}
                    </p>
                </div>
                
                <NavButton id="logout" label="Logout" icon={<LogOutIcon className="w-6 h-6" />} action={logout} />
            </div>
        </aside>
    );
};

export default SideMenu;