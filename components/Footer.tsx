import React from 'react';

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();
    return (
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4">
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                &copy; {currentYear} Peppol SMP Lookup. All rights reserved.
            </p>
        </footer>
    );
};

export default Footer;