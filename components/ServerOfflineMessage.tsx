import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const ServerOffIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M4 8h12a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-12a1 1 0 0 1 -1 -1v-2a1 1 0 0 1 1 -1z" />
        <path d="M4 16h12a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-12a1 1 0 0 1 -1 -1v-2a1 1 0 0 1 1 -1z" />
        <path d="M7 10v.01" />
        <path d="M7 18v.01" />
        <path d="M3 3l18 18" />
    </svg>
);

const ServerOfflineMessage: React.FC = () => {
    const { retryConnection } = useAuth();

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
            <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-2xl w-full">
                <div className="flex justify-center items-center mb-4">
                    <ServerOffIcon className="w-20 h-20 text-red-400" />
                </div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                    Server Connection Failed
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    The application could not connect to the backend server. Please ensure the server is running and accessible.
                </p>

                <div className="text-left bg-gray-50 dark:bg-gray-700 p-6 rounded-lg space-y-3 my-6">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">How to Start the Server</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        From your project's root directory, run the following commands in your terminal:
                    </p>
                    <pre className="bg-gray-200 dark:bg-gray-800 rounded p-3 text-sm font-mono overflow-x-auto">
                        <code>
                            # 1. Install dependencies (if you haven't already)<br/>
                            npm install<br/><br/>
                            # 2. Run the development server<br/>
                            npm run dev
                        </code>
                    </pre>
                </div>

                <button
                    onClick={retryConnection}
                    className="mt-4 px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    Retry Connection
                </button>
            </div>
        </div>
    );
};

export default ServerOfflineMessage;