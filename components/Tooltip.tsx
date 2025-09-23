import React from 'react';

interface TooltipProps {
    children: React.ReactNode;
    text: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

const Tooltip: React.FC<TooltipProps> = ({ children, text, position = 'top' }) => {
    const positionClasses: Record<string, string> = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    };

    return (
        <div className="relative group flex items-center">
            {children}
            <div className={`absolute ${positionClasses[position]} w-max whitespace-nowrap px-3 py-1.5 bg-gray-900 dark:bg-gray-700 text-white dark:text-gray-100 text-xs font-medium rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10`}>
                {text}
            </div>
        </div>
    );
};

export default Tooltip;