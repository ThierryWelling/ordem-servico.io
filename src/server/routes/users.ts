import express, { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { authenticateToken } from '../middleware/auth';
import bcrypt from 'bcrypt';

const router = express.Router();

// Buscar todos os usuários
router.get('/', authenticateToken, (async (_: Request, res: Response): Promise<void> => {
    try {
        const [users] = await pool.query<RowDataPacket[]>('SELECT id, name, email, role, status FROM users');
        res.json(users);
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
}) as express.RequestHandler);

export default router;