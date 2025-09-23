import React, { useState } from 'react';
import { SearchIcon } from './IconComponents';

interface SearchFormProps {
    onSearch: (participantId: string) => void;
    isLoading: boolean;
}

const PEPPOL_SCHEMES = [
    { value: 'iso6523-actorid-upis', label: 'GLN (0088)' },
    { value: 'duns', label: 'DUNS (0060)' },
    { value: 'gleif-lei', label: 'LEI (0199)' },
    { value: 'iso9735-3', label: 'EAN Location Code' },
];

const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading }) => {
    const [scheme, setScheme] = useState(PEPPOL_SCHEMES[0].value);
    const [identifier, setIdentifier] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (identifier.trim()) {
            onSearch(`${scheme}::${identifier.trim()}`);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mb-6">
            <label htmlFor="participant-identifier" className="block text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">
                PEPPOL Participant ID
            </label>
            <div className="flex flex-col sm:flex-row items-stretch">
                <select
                    id="participant-scheme"
                    value={scheme}
                    onChange={(e) => setScheme(e.target.value)}
                    className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-t-md sm:rounded-l-md sm:rounded-t-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-800 text-lg sm:w-1/4"
                    disabled={isLoading}
                >
                    {PEPPOL_SCHEMES.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                </select>
                <div className="relative flex-grow">
                    <input
                        id="participant-identifier"
                        type="text"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="Enter identifier..."
                        className="w-full px-4 py-3 border-t-0 border-b-0 sm:border-l-0 sm:border-t border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-lg"
                        disabled={isLoading}
                        required
                    />
                    <button
                        type="submit"
                        className="absolute inset-y-0 right-0 px-4 flex items-center bg-blue-600 text-white rounded-r-md hover:bg-blue-700 disabled:bg-blue-300"
                        disabled={isLoading || !identifier}
                        aria-label="Search"
                    >
                        <SearchIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>
             <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Select a scheme and enter the corresponding identifier.
            </p>
        </form>
    );
};

export default SearchForm;
