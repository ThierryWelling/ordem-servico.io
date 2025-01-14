import express, { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database';
import { RowDataPacket } from 'mysql2';

const router = express.Router();

// Buscar conversas de um usuário
router.get('/conversations/:userId', async (req: Request, res: Response) => {
    try {
        const [conversations] = await pool.query<RowDataPacket[]>(`
            SELECT DISTINCT 
                CASE 
                    WHEN cm.sender_id = ? THEN cm.receiver_id
                    ELSE cm.sender_id
                END as other_user_id,
                u.name as other_user_name,
                u.role as other_user_role,
                (
                    SELECT content 
                    FROM chat_messages 
                    WHERE (sender_id = ? AND receiver_id = u.id) 
                        OR (sender_id = u.id AND receiver_id = ?)
                    ORDER BY created_at DESC 
                    LIMIT 1
                ) as last_message,
                (
                    SELECT created_at 
                    FROM chat_messages 
                    WHERE (sender_id = ? AND receiver_id = u.id) 
                        OR (sender_id = u.id AND receiver_id = ?)
                    ORDER BY created_at DESC 
                    LIMIT 1
                ) as last_message_time,
                (
                    SELECT COUNT(*) 
                    FROM chat_messages 
                    WHERE sender_id = u.id 
                        AND receiver_id = ? 
                        AND read_at IS NULL
                ) as unread_count
            FROM chat_messages cm
            JOIN users u ON (
                CASE 
                    WHEN cm.sender_id = ? THEN cm.receiver_id
                    ELSE cm.sender_id
                END = u.id
            )
            WHERE cm.sender_id = ? OR cm.receiver_id = ?
            ORDER BY last_message_time DESC
        `, [
            req.params.userId, 
            req.params.userId, 
            req.params.userId,
            req.params.userId,
            req.params.userId,
            req.params.userId,
            req.params.userId,
            req.params.userId,
            req.params.userId
        ]);

        res.json(conversations);
    } catch (error) {
        console.error('Erro ao buscar conversas:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// Buscar mensagens entre dois usuários
router.get('/messages/:userId/:otherUserId', async (req: Request, res: Response) => {
    try {
        // Marcar mensagens como lidas
        await pool.query(
            'UPDATE chat_messages SET read_at = CURRENT_TIMESTAMP WHERE sender_id = ? AND receiver_id = ? AND read_at IS NULL',
            [req.params.otherUserId, req.params.userId]
        );

        // Buscar mensagens
        const [messages] = await pool.query<RowDataPacket[]>(`
            SELECT cm.*, 
                   s.name as sender_name,
                   r.name as receiver_name
            FROM chat_messages cm
            JOIN users s ON cm.sender_id = s.id
            JOIN users r ON cm.receiver_id = r.id
            WHERE (cm.sender_id = ? AND cm.receiver_id = ?)
               OR (cm.sender_id = ? AND cm.receiver_id = ?)
            ORDER BY cm.created_at ASC
        `, [
            req.params.userId,
            req.params.otherUserId,
            req.params.otherUserId,
            req.params.userId
        ]);

        res.json(messages);
    } catch (error) {
        console.error('Erro ao buscar mensagens:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// Enviar mensagem
router.post('/', async (req: Request, res: Response) => {
    const { sender_id, receiver_id, content } = req.body;

    if (!sender_id || !receiver_id || !content) {
        return res.status(400).json({ message: 'Campos obrigatórios não preenchidos' });
    }

    try {
        const id = uuidv4();
        await pool.query(
            'INSERT INTO chat_messages (id, sender_id, receiver_id, content) VALUES (?, ?, ?, ?)',
            [id, sender_id, receiver_id, content]
        );

        // Buscar a mensagem criada com informações dos usuários
        const [messages] = await pool.query<RowDataPacket[]>(`
            SELECT cm.*, 
                   s.name as sender_name,
                   r.name as receiver_name
            FROM chat_messages cm
            JOIN users s ON cm.sender_id = s.id
            JOIN users r ON cm.receiver_id = r.id
            WHERE cm.id = ?
        `, [id]);

        res.status(201).json(messages[0]);
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// Marcar mensagens como lidas
router.put('/read/:senderId/:receiverId', async (req: Request, res: Response) => {
    try {
        await pool.query(
            'UPDATE chat_messages SET read_at = CURRENT_TIMESTAMP WHERE sender_id = ? AND receiver_id = ? AND read_at IS NULL',
            [req.params.senderId, req.params.receiverId]
        );

        res.status(204).send();
    } catch (error) {
        console.error('Erro ao marcar mensagens como lidas:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

export { router }; 