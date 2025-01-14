import express, { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database';
import { RowDataPacket } from 'mysql2';

const router = express.Router();

// Buscar todas as atividades de uma ordem de serviço
router.get('/service-order/:serviceOrderId', async (req: Request, res: Response) => {
    try {
        const [activities] = await pool.query<RowDataPacket[]>(`
            SELECT a.*, u.name as created_by_name 
            FROM activities a 
            LEFT JOIN users u ON a.created_by = u.id 
            WHERE a.service_order_id = ?
            ORDER BY a.created_at DESC
        `, [req.params.serviceOrderId]);
        
        res.json(activities);
    } catch (error) {
        console.error('Erro ao buscar atividades:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// Buscar atividade por ID
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const [activities] = await pool.query<RowDataPacket[]>(`
            SELECT a.*, u.name as created_by_name 
            FROM activities a 
            LEFT JOIN users u ON a.created_by = u.id 
            WHERE a.id = ?
        `, [req.params.id]);

        if (activities.length === 0) {
            return res.status(404).json({ message: 'Atividade não encontrada' });
        }

        res.json(activities[0]);
    } catch (error) {
        console.error('Erro ao buscar atividade:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// Criar nova atividade
router.post('/', async (req: Request, res: Response) => {
    const { service_order_id, description, created_by } = req.body;

    if (!service_order_id || !description || !created_by) {
        return res.status(400).json({ message: 'Campos obrigatórios não preenchidos' });
    }

    try {
        const id = uuidv4();
        await pool.query(
            'INSERT INTO activities (id, service_order_id, description, status, created_by) VALUES (?, ?, ?, ?, ?)',
            [id, service_order_id, description, 'pending', created_by]
        );

        // Buscar a atividade criada com informações do usuário
        const [activities] = await pool.query<RowDataPacket[]>(`
            SELECT a.*, u.name as created_by_name 
            FROM activities a 
            LEFT JOIN users u ON a.created_by = u.id 
            WHERE a.id = ?
        `, [id]);

        res.status(201).json(activities[0]);
    } catch (error) {
        console.error('Erro ao criar atividade:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// Atualizar atividade
router.put('/:id', async (req: Request, res: Response) => {
    const { description, status } = req.body;

    try {
        let query = 'UPDATE activities SET description = ?, status = ?';
        const params = [description, status];

        if (status === 'completed') {
            query += ', completed_at = CURRENT_TIMESTAMP';
        }

        query += ' WHERE id = ?';
        params.push(req.params.id);

        const [result] = await pool.query<RowDataPacket[]>(query, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Atividade não encontrada' });
        }

        // Buscar a atividade atualizada
        const [activities] = await pool.query<RowDataPacket[]>(`
            SELECT a.*, u.name as created_by_name 
            FROM activities a 
            LEFT JOIN users u ON a.created_by = u.id 
            WHERE a.id = ?
        `, [req.params.id]);

        res.json(activities[0]);
    } catch (error) {
        console.error('Erro ao atualizar atividade:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// Deletar atividade
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const [result] = await pool.query<RowDataPacket[]>(
            'DELETE FROM activities WHERE id = ?', 
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Atividade não encontrada' });
        }

        res.status(204).send();
    } catch (error) {
        console.error('Erro ao deletar atividade:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

export { router }; 