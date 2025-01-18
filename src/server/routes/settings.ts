import express, { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Buscar configurações
router.get('/', authenticateToken, (async (_: Request, res: Response): Promise<void> => {
    try {
        const [settings] = await pool.query<RowDataPacket[]>('SELECT * FROM settings LIMIT 1');
        res.json(settings[0] || {});
    } catch (error) {
        console.error('Erro ao buscar configurações:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
}) as express.RequestHandler);

export default router;