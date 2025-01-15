import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ordem_servico',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export default {
    query: async <T>(sql: string, params?: unknown[]): Promise<T[]> => {
        const [rows] = await pool.execute(sql, params);
        return rows as T[];
    },
    
    queryOne: async <T>(sql: string, params?: unknown[]): Promise<T | null> => {
        const [rows] = await pool.execute(sql, params);
        const results = rows as T[];
        return results.length > 0 ? results[0] : null;
    }
}; 