import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { SunIcon, MoonIcon } from './IconComponents';
import Tooltip from './Tooltip';

const ThemeToggleButton: React.FC = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <Tooltip text={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}>
            <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
                aria-label="Toggle theme"
            >
                {theme === 'light' ? (
                    <MoonIcon className="w-6 h-6" />
                ) : (
                    <SunIcon className="w-6 h-6 text-yellow-400" />
                )}
            </button>
        </Tooltip>
    );
};

export default ThemeToggleButton;
