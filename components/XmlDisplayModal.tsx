import React from 'react';

interface XmlDisplayModalProps {
    title: string;
    xmlString: string;
    onClose: () => void;
}

const XmlDisplayModal: React.FC<XmlDisplayModalProps> = ({ title, xmlString, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl m-4 max-w-4xl w-full max-h-[90vh] flex flex-col">
                <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-semibold">{title}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-2xl font-bold">&times;</button>
                </div>
                <div className="p-6 overflow-y-auto">
                     <pre className="bg-gray-100 dark:bg-gray-900 rounded p-4 text-sm font-mono overflow-x-auto">
                        <code>
                            {xmlString}
                        </code>
                    </pre>
                </div>
                 <div className="p-4 border-t dark:border-gray-700 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Close</button>
                </div>
            </div>
        </div>
    );
};

export default XmlDisplayModal;
