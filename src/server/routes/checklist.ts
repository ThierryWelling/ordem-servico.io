import express, { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Buscar todos os itens do checklist de uma ordem de serviço
router.get('/service-order/:serviceOrderId', authenticateToken, (async (req: Request, res: Response): Promise<void> => {
    try {
        const [items] = await pool.query<RowDataPacket[]>(
            `SELECT * FROM checklist_items 
             WHERE service_order_id = ?
             ORDER BY created_at ASC`,
            [req.params.serviceOrderId]
        );
        
        res.json(items);
    } catch (error) {
        console.error('Erro ao buscar itens do checklist:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
}) as express.RequestHandler);

// Adicionar novo item ao checklist
router.post('/', authenticateToken, (async (req: Request, res: Response): Promise<void> => {
    try {
        const { service_order_id, text } = req.body;

        if (!service_order_id || !text) {
            res.status(400).json({ message: 'Campos obrigatórios não preenchidos' });
            return;
        }

        const id = uuidv4();
        await pool.query<ResultSetHeader>(
            `INSERT INTO checklist_items (id, service_order_id, text, completed)
             VALUES (?, ?, ?, false)`,
            [id, service_order_id, text]
        );

        const [newItem] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM checklist_items WHERE id = ?',
            [id]
        );

        res.status(201).json(newItem[0]);
    } catch (error) {
        console.error('Erro ao criar item do checklist:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
}) as express.RequestHandler);

// Atualizar item do checklist
router.put('/:id', authenticateToken, (async (req: Request, res: Response): Promise<void> => {
    try {
        const { text, completed } = req.body;
        const { id } = req.params;

        const [result] = await pool.query<ResultSetHeader>(
            `UPDATE checklist_items 
             SET text = ?, completed = ?, updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [text, completed, id]
        );

        if (result.affectedRows === 0) {
            res.status(404).json({ message: 'Item do checklist não encontrado' });
            return;
        }

        const [updatedItem] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM checklist_items WHERE id = ?',
            [id]
        );

        res.json(updatedItem[0]);
    } catch (error) {
        console.error('Erro ao atualizar item do checklist:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
}) as express.RequestHandler);

// Deletar item do checklist
router.delete('/:id', authenticateToken, (async (req: Request, res: Response): Promise<void> => {
    try {
        const [result] = await pool.query<ResultSetHeader>(
            'DELETE FROM checklist_items WHERE id = ?',
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            res.status(404).json({ message: 'Item do checklist não encontrado' });
            return;
        }

        res.status(204).send();
    } catch (error) {
        console.error('Erro ao deletar item do checklist:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
}) as express.RequestHandler);

export default router; 