import React from 'react';
import { useHistory } from '../contexts/HistoryContext';
import { formatDistanceToNow } from '../utils/dateUtils';
import { TrashIcon, SearchIcon } from './IconComponents';
import Tooltip from './Tooltip';

interface HistoryViewProps {
    onSelect: () => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ onSelect }) => {
    const { history, clearHistory, addHistoryItem } = useHistory();

    const handleSelect = (participantId: string) => {
        // Selecting from history should also update its timestamp and move to top
        addHistoryItem({ participantId });
        onSelect();
    };

    if (history.length === 0) {
        return <p className="text-gray-500 dark:text-gray-400 text-center">Your search history is empty.</p>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-500">Your recent lookups.</p>
                <button
                    onClick={clearHistory}
                    className="flex items-center text-sm text-red-500 hover:text-red-700"
                >
                    <TrashIcon className="w-4 h-4 mr-1" />
                    Clear History
                </button>
            </div>
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {history.map(item => (
                    <li key={item.id} className="py-3 flex items-center justify-between">
                        <div>
                            <p className="font-mono text-md text-gray-800 dark:text-gray-200">{item.participantId}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{formatDistanceToNow(item.timestamp)}</p>
                        </div>
                        <Tooltip text={`Look up ${item.participantId} again`}>
                            <button
                                onClick={() => handleSelect(item.participantId)}
                                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                                aria-label={`Search for ${item.participantId}`}
                            >
                                <SearchIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                            </button>
                        </Tooltip>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default HistoryView;