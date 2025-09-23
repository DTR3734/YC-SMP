import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        const success = await login(username, password);
        if (!success) {
            setError('Invalid username or password.');
        }
        setIsLoading(false);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
            <div className="px-8 py-6 text-left bg-white dark:bg-gray-800 shadow-lg rounded-lg max-w-sm w-full">
                <h3 className="text-2xl font-bold text-center text-gray-800 dark:text-white">PEPPOL SMP</h3>
                <p className="text-center text-gray-600 dark:text-gray-400 mb-4">Login to your account</p>
                <form onSubmit={handleSubmit}>
                    <div className="mt-4">
                        <div>
                            <label className="block" htmlFor="username">Username</label>
                            <input
                                type="text"
                                placeholder="Username"
                                id="username"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white dark:bg-gray-700 dark:border-gray-600"
                                required
                            />
                        </div>
                        <div className="mt-4">
                            <label className="block" htmlFor="password">Password</label>
                            <input
                                type="password"
                                placeholder="Password"
                                id="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white dark:bg-gray-700 dark:border-gray-600"
                                required
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                        <div className="flex items-baseline justify-between">
                            <button 
                                type="submit" 
                                className="w-full px-6 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-900"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Logging in...' : 'Login'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;