import { User } from '../../types';
import pool from '../config/database';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

class UsersService {
    async getAllUsers(): Promise<User[]> {
        const [users] = await pool.query<RowDataPacket[]>(
            'SELECT id, name, email, role, sequence FROM users ORDER BY sequence ASC'
        );
        return users as User[];
    }

    async getUserById(id: string): Promise<User | null> {
        const [users] = await pool.query<RowDataPacket[]>(
            'SELECT id, name, email, role, sequence FROM users WHERE id = ?',
            [id]
        );
        return users.length > 0 ? users[0] as User : null;
    }

    async createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'> & { password: string }): Promise<User> {
        const id = uuidv4();
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
            [id, userData.name, userData.email, hashedPassword, userData.role]
        );

        if (result.affectedRows === 0) {
            throw new Error('Erro ao criar usuário');
        }

        const { password, ...userWithoutPassword } = userData;
        return {
            id,
            ...userWithoutPassword,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
    }

    async updateUser(id: string, userData: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>): Promise<User | null> {
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            const updateFields = [];
            const updateValues = [];

            if (userData.name) {
                updateFields.push('name = ?');
                updateValues.push(userData.name);
            }
            if (userData.email) {
                updateFields.push('email = ?');
                updateValues.push(userData.email);
            }
            if (userData.role) {
                updateFields.push('role = ?');
                updateValues.push(userData.role);
            }
            if (userData.sequence !== undefined) {
                updateFields.push('sequence = ?');
                updateValues.push(userData.sequence);
            }

            if (updateFields.length > 0) {
                const query = `UPDATE users SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = ?`;
                await connection.query<ResultSetHeader>(query, [...updateValues, id]);
            }

            await connection.commit();

            const [updatedUser] = await pool.query<RowDataPacket[]>(
                'SELECT id, name, email, role, sequence, created_at, updated_at FROM users WHERE id = ?',
                [id]
            );

            return updatedUser.length > 0 ? updatedUser[0] as User : null;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async deleteUser(id: string): Promise<boolean> {
        const [result] = await pool.query<ResultSetHeader>(
            'DELETE FROM users WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }

    async updateUserSequences(users: User[]): Promise<User[]> {
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            for (const user of users) {
                if (user.sequence !== undefined) {
                    await connection.query<ResultSetHeader>(
                        'UPDATE users SET sequence = ?, updated_at = NOW() WHERE id = ?',
                        [user.sequence, user.id]
                    );
                }
            }

            await connection.commit();

            const [updatedUsers] = await pool.query<RowDataPacket[]>(
                'SELECT id, name, email, role, sequence FROM users ORDER BY sequence ASC'
            );

            return updatedUsers as User[];
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}

export default new UsersService(); 