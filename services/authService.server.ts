import { getDb } from '../database/database';
import type { User } from '../types.server';
import { verifyPassword, hashPassword } from '../utils/security.server';

// Internal type for database rows that include authentication fields.
type UserWithAuth = User & { password_hash: string; password_salt: string };

export const login = async (username: string, pass: string): Promise<Omit<User, 'password'> | null> => {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE username = ?', [username], (err, row: UserWithAuth) => {
            if (err) return reject(err);

            if (row && verifyPassword(pass, row.password_salt, row.password_hash)) {
                // On successful verification, return the user object without auth fields.
                const { password_hash, password_salt, password, ...userToReturn } = row;
                resolve(userToReturn);
            } else {
                // Invalid username or password.
                resolve(null);
            }
        });
    });
};

export const changePassword = async (userId: string, oldPass: string, newPass: string): Promise<{ success: boolean; message: string; }> => {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE id = ?', [userId], (err, row: UserWithAuth) => {
            if (err) return reject(err);

            if (!row || !verifyPassword(oldPass, row.password_salt, row.password_hash)) {
                return resolve({ success: false, message: 'Current password is incorrect.' });
            }

            const { hash, salt } = hashPassword(newPass);
            db.run('UPDATE users SET password_hash = ?, password_salt = ? WHERE id = ?', [hash, salt, userId], (err) => {
                if (err) return reject(err);
                resolve({ success: true, message: 'Password changed successfully.' });
            });
        });
    });
};
