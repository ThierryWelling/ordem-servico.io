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
            'INSERT INTO activities (id, service_order_id, description, status, created_by, created_by_name, type, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [
                id,
                data.serviceOrderId,
                data.description,
                data.status,
                data.createdBy,
                data.createdByName,
                data.type,
                data.details ? JSON.stringify(data.details) : null
            ]
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