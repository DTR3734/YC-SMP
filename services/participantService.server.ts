import { getDb } from '../database/database';
import type { ManagedParticipant } from '../types.server';

export const MOCK_PARTICIPANTS: ManagedParticipant[] = [
    { id: '1', participantId: 'iso6523-actorid-upis::0088:1111222233334', name: 'Managed Corp 1', smpIdentifier: 'smp.example.org', status: 'active', createdAt: new Date('2023-01-15T10:00:00Z'), updatedAt: new Date('2023-05-20T14:30:00Z') },
    { id: '2', participantId: 'iso6523-actorid-upis::0060:444455556', name: 'Managed Corp 2', smpIdentifier: 'smp.example.com', status: 'inactive', createdAt: new Date('2022-11-01T09:00:00Z'), updatedAt: new Date('2023-02-10T11:00:00Z') },
    { id: '3', participantId: 'iso6523-actorid-upis::0088:7777888899990', name: 'Mock Corp 3', smpIdentifier: 'mock-smp.example.org', status: 'active', createdAt: new Date('2023-08-01T09:00:00Z'), updatedAt: new Date('2023-09-10T11:00:00Z') },
];

export const getParticipants = async (): Promise<ManagedParticipant[]> => {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM managed_participants ORDER BY updatedAt DESC", [], (err, rows: ManagedParticipant[]) => {
            if (err) return reject(err);
            resolve(rows.map(r => ({ ...r, createdAt: new Date(r.createdAt), updatedAt: new Date(r.updatedAt) })));
        });
    });
};

export const addParticipant = async (participant: Omit<ManagedParticipant, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        const newParticipant = {
            ...participant,
            id: `participant-${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        db.run("INSERT INTO managed_participants (id, participantId, name, smpIdentifier, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
            Object.values(newParticipant), (err) => {
            if (err) return reject(err);
            resolve();
        });
    });
};

export const updateParticipant = async (id: string, participant: Partial<ManagedParticipant>): Promise<void> => {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        const updatedAt = new Date().toISOString();
        db.run("UPDATE managed_participants SET name = ?, participantId = ?, smpIdentifier = ?, status = ?, updatedAt = ? WHERE id = ?",
            [participant.name, participant.participantId, participant.smpIdentifier, participant.status, updatedAt, id], (err) => {
            if (err) return reject(err);
            resolve();
        });
    });
};

export const deleteParticipant = async (id: string): Promise<void> => {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM managed_participants WHERE id = ?", [id], (err) => {
            if (err) return reject(err);
            resolve();
        });
    });
};