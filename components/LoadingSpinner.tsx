import React from 'react';

interface LoadingSpinnerProps {
    text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ text = 'Loading...' }) => {
    return (
        <div className="flex flex-col items-center justify-center space-y-2 my-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
            <p className="text-gray-600 dark:text-gray-300">{text}</p>
        </div>
    );
};

export default LoadingSpinner;
