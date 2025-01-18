import express, { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Buscar conversas de um usuário
router.get('/conversations/:userId', authenticateToken, (async (req: Request, res: Response): Promise<void> => {
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
}) as express.RequestHandler);

// Buscar mensagens entre dois usuários
router.get('/messages/:senderId/:receiverId', authenticateToken, (async (req: Request, res: Response): Promise<void> => {
    try {
        // Marcar mensagens como lidas
        await pool.query<ResultSetHeader>(
            'UPDATE chat_messages SET read_at = CURRENT_TIMESTAMP WHERE sender_id = ? AND receiver_id = ? AND read_at IS NULL',
            [req.params.senderId, req.params.receiverId]
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
            req.params.senderId,
            req.params.receiverId,
            req.params.receiverId,
            req.params.senderId
        ]);

        res.json(messages);
    } catch (error) {
        console.error('Erro ao buscar mensagens:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
}) as express.RequestHandler);

export default router;