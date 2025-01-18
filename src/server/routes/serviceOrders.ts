import express, { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Buscar todas as ordens de serviço
router.get('/', authenticateToken, (async (_: Request, res: Response): Promise<void> => {
    try {
        const [serviceOrders] = await pool.query<RowDataPacket[]>('SELECT * FROM service_orders');
        res.json(serviceOrders);
    } catch (error) {
        console.error('Erro ao buscar ordens de serviço:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
}) as express.RequestHandler);

// Buscar uma ordem de serviço específica
router.get('/:id', authenticateToken, (async (req: Request, res: Response): Promise<void> => {
    try {
        const [serviceOrders] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM service_orders WHERE id = ?',
            [req.params.id]
        );

        if (serviceOrders.length === 0) {
            res.status(404).json({ message: 'Ordem de serviço não encontrada' });
            return;
        }

        res.json(serviceOrders[0]);
    } catch (error) {
        console.error('Erro ao buscar ordem de serviço:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
}) as express.RequestHandler);

// Buscar ordens de serviço por usuário
router.get('/user/:assigned_to', authenticateToken, (async (req: Request, res: Response): Promise<void> => {
    try {
        const [serviceOrders] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM service_orders WHERE assigned_to = ?',
            [req.params.assigned_to]
        );
        res.json(serviceOrders);
    } catch (error) {
        console.error('Erro ao buscar ordens de serviço do usuário:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
}) as express.RequestHandler);

export default router;