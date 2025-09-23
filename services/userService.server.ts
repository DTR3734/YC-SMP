import { getDb } from '../database/database';
import type { User } from '../types.server';
import { hashPassword } from '../utils/security.server';

export const MOCK_USERS: User[] = [
    { id: 'user-1', username: 'admin', password: 'password', role: 'admin', createdAt: new Date('2023-01-01T10:00:00Z') },
    { id: 'user-2', username: 'manager', password: 'password', role: 'manager', createdAt: new Date('2023-02-15T11:00:00Z') },
    { id: 'user-3', username: 'viewer', password: 'password', role: 'viewer', createdAt: new Date('2023-03-20T12:00:00Z') },
];

export const getUsers = async (): Promise<Omit<User, 'password'>[]> => {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        // Query explicitly excludes password hash and salt for security.
        db.all("SELECT id, username, role, createdAt FROM users ORDER BY createdAt DESC", [], (err, rows: User[]) => {
            if (err) return reject(err);
            resolve(rows.map(r => ({...r, createdAt: new Date(r.createdAt) })));
        });
    });
};

export const addUser = async (user: Omit<User, 'id' | 'createdAt'>): Promise<void> => {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        if (!user.password) {
            return reject(new Error("Password is required for a new user."));
        }
        const { hash, salt } = hashPassword(user.password);
        const id = `user-${Date.now()}`;
        const createdAt = new Date().toISOString();
        db.run("INSERT INTO users (id, username, password_hash, password_salt, role, createdAt) VALUES (?, ?, ?, ?, ?, ?)",
            [id, user.username, hash, salt, user.role, createdAt], (err) => {
            if (err) return reject(err);
            resolve();
        });
    });
};

export const updateUser = async (id: string, user: Partial<User>): Promise<void> => {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        const hasPassword = user.password && user.password.length > 0;
        
        if (hasPassword) {
            const { hash, salt } = hashPassword(user.password!);
            const sql = "UPDATE users SET username = ?, role = ?, password_hash = ?, password_salt = ? WHERE id = ?";
            const params = [user.username, user.role, hash, salt, id];
            db.run(sql, params, (err) => {
                if (err) return reject(err);
                resolve();
            });
        } else {
            // Update user details without changing the password
            const sql = "UPDATE users SET username = ?, role = ? WHERE id = ?";
            const params = [user.username, user.role, id];
            db.run(sql, params, (err) => {
                if (err) return reject(err);
                resolve();
            });
        }
    });
};

export const deleteUser = async (id: string): Promise<void> => {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM users WHERE id = ?", [id], (err) => {
            if (err) return reject(err);
            resolve();
        });
    });
};
