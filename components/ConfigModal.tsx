
import React, { useState, useContext } from 'react';
import { ConfigContext } from '../contexts/ConfigContext';
import { Button } from './common/Button';
import { Input } from './common/Input';
import { Modal } from './common/Modal';

export const ConfigModal: React.FC = () => {
    const [isOpen, setIsOpen] = useState(true);
    const [serverAddress, setServerAddress] = useState('');
    const config = useContext(ConfigContext);

    const handleSave = () => {
        if (config) {
            config.setServerAddress(serverAddress);
        }
        setIsOpen(false);
    };

    return (
        <Modal isOpen={isOpen} onClose={() => {}}>
            <div className="p-4">
                <h2 className="text-lg font-bold mb-4">Server Configuration</h2>
                <p className="mb-4">Please enter the server address.</p>
                <Input
                    type="text"
                    value={serverAddress}
                    onChange={(e) => setServerAddress(e.target.value)}
                    placeholder="e.g., https://myserver.com:3001"
                />
                <div className="mt-4 flex justify-end">
                    <Button onClick={handleSave}>Save</Button>
                </div>
            </div>
        </Modal>
    );
};
