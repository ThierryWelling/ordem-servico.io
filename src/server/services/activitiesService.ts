import { Activity } from '../../types';
import pool from '../config/database';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

class ActivitiesService {
    async getAllActivities(): Promise<Activity[]> {
        const [activities] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM activities ORDER BY created_at DESC'
        );
        return activities as Activity[];
    }

    async createActivity(activityData: Omit<Activity, 'id' | 'created_at'>): Promise<Activity> {
        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO activities (service_order_id, user_id, action, details) VALUES (?, ?, ?, ?)',
            [activityData.service_order_id, activityData.user_id, activityData.action, activityData.details]
        );

        const newActivity: Activity = {
            id: result.insertId.toString(),
            ...activityData,
            created_at: new Date().toISOString()
        };

        return newActivity;
    }
}

export default new ActivitiesService(); 