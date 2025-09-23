
import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import { HistoryProvider } from './contexts/HistoryContext';
import { ParticipantProvider } from './contexts/ParticipantContext';
import { UserProvider } from './contexts/UserContext';
import { ConfigProvider, useConfig } from './contexts/ConfigContext';

import LoginPage from './components/LoginPage';
import Header from './components/Header';
import SideMenu from './components/SideMenu';
import LookupView from './components/LookupView';
import BulkLookupView from './components/BulkLookupView';
import AdminView from './components/AdminView';
import SmpManagerView from './components/SmpManagerView';
import UserManagementView from './components/UserManagementView';
import CertificationBanner from './components/CertificationBanner';
import AboutView from './components/AboutView';

import SettingsModal from './components/SettingsModal';
import HistoryModal from './components/HistoryModal';
import ErrorBoundary from './components/ErrorBoundary';
import type { UserRole } from './types';
import { ConfigModal } from './components/ConfigModal';
import LoadingSpinner from './components/LoadingSpinner';

const AppContent: React.FC = () => {
    const { isAuthenticated, currentUser } = useAuth();
    const { settings } = useSettings();
    const { isConfigured, isServerOnline, checkServerStatus } = useConfig();
    const [activeView, setActiveView] = React.useState('lookup');
    const [isSettingsOpen, setSettingsOpen] = React.useState(false);
    const [isHistoryOpen, setHistoryOpen] = React.useState(false);

    React.useEffect(() => {
        checkServerStatus();
    }, []);

    if (!isConfigured || !isServerOnline) {
        return <ConfigModal />;
    }

    if (!isAuthenticated || !currentUser) {
        return <LoginPage />;
    }

    const hasAccess = (allowedRoles: UserRole[]) => {
        return allowedRoles.includes(currentUser.role);
    };
    
    const renderView = () => {
        switch (activeView) {
            case 'lookup': 
                return hasAccess(['admin', 'manager', 'viewer']) ? <LookupView /> : null;
            case 'bulk': 
                return hasAccess(['admin', 'manager', 'viewer']) ? <BulkLookupView /> : null;
            case 'smp-manager': 
                return hasAccess(['admin', 'manager']) ? <SmpManagerView /> : null;
            case 'user-management':
                return hasAccess(['admin']) ? <UserManagementView /> : null;
            case 'admin': 
                return hasAccess(['admin']) ? <AdminView /> : null;
            case 'about':
                return hasAccess(['admin', 'manager', 'viewer']) ? <AboutView /> : null;
            default: return <LookupView />;
        }
    };
    
    const viewComponent = renderView();

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <SideMenu 
                activeView={activeView} 
                setActiveView={setActiveView} 
                openSettings={() => setSettingsOpen(true)} 
                openHistory={() => setHistoryOpen(true)}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                {settings.appMode === 'certification' && <CertificationBanner />}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-6">
                    {viewComponent ? viewComponent : (
                        <div className="text-center p-8">
                            <h2 className="text-xl font-semibold text-red-500">Access Denied</h2>
                            <p className="text-gray-600 dark:text-gray-400">You do not have permission to view this page.</p>
                        </div>
                    )}
                </main>
            </div>
            <SettingsModal isOpen={isSettingsOpen} onClose={() => setSettingsOpen(false)} />
            <HistoryModal isOpen={isHistoryOpen} onClose={() => setHistoryOpen(false)} />
        </div>
    );
};

const App: React.FC = () => {
    return (
        <ErrorBoundary>
            <ThemeProvider>
                <ConfigProvider>
                    <UserProvider>
                        <AuthProvider>
                            <SettingsProvider>
                                <HistoryProvider>
                                    <ParticipantProvider>
                                        <AppContent />
                                    </ParticipantProvider>
                                </HistoryProvider>
                            </SettingsProvider>
                        </AuthProvider>
                    </UserProvider>
                </ConfigProvider>
            </ThemeProvider>
        </ErrorBoundary>
    );
};

export default App;
