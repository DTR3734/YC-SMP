import React from 'react';
import { AlertTriangleIcon } from './IconComponents';

interface ErrorMessageProps {
    message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
    if (!message) {
        return null;
    }

    return (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md my-4" role="alert">
            <div className="flex">
                <div className="py-1"><AlertTriangleIcon className="h-6 w-6 text-red-500 mr-4" /></div>
                <div>
                    <p className="font-bold">Error</p>
                    <p>{message}</p>
                </div>
            </div>
        </div>
    );
};

export default ErrorMessage;
