import { Activity } from '../../types';
import pool from '../config/database';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { v4 as uuidv4 } from 'uuid';

class ActivitiesService {
    async getAllActivities(): Promise<Activity[]> {
        const [activities] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM activities ORDER BY created_at DESC'
        );
        return activities as Activity[];
    }

    async createActivity(data: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>): Promise<Activity> {
        const id = uuidv4();
        const timestamp = new Date().toISOString();

        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO activities (id, service_order_id, user_id, description, action, details) VALUES (?, ?, ?, ?, ?, ?)',
            [id, data.serviceOrderId, data.userId, data.description, data.action, JSON.stringify(data.details)]
        );

        if (result.affectedRows === 0) {
            throw new Error('Erro ao criar atividade');
        }

        return {
            id,
            ...data,
            createdAt: timestamp,
            updatedAt: timestamp
        };
    }
}

export default new ActivitiesService(); 