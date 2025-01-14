import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database';
import { RowDataPacket } from 'mysql2';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Buscar todos os usuários
router.get('/', authenticateToken, async (req, res) => {
    try {
        const [users] = await pool.query<RowDataPacket[]>(
            'SELECT id, name, email, role, sequence FROM users ORDER BY sequence ASC'
        );
        res.json(users);
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// Buscar usuário por ID
router.get('/:id', async (req, res) => {
    try {
        const [users] = await pool.query<RowDataPacket[]>('SELECT id, name, email, role FROM users WHERE id = ?', [req.params.id]);
        
        if (users.length === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        
        res.json(users[0]);
    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// Criar novo usuário
router.post('/', async (req, res) => {
    const { name, email, password, role } = req.body;
    
    if (!name || !email || !password || !role) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }

    try {
        const id = uuidv4();
        await pool.query(
            'INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
            [id, name, email, password, role]
        );
        
        res.status(201).json({ id, name, email, role });
    } catch (error) {
        console.error('Erro ao criar usuário:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// Atualizar usuário
router.put('/:id', authenticateToken, async (req, res) => {
    const { name, email, role, sequence } = req.body;
    const { id } = req.params;

    try {
        // Verifica se o usuário existe
        const [users] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM users WHERE id = ?',
            [id]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // Atualiza o usuário
            const updateFields = [];
            const updateValues = [];

            if (name) {
                updateFields.push('name = ?');
                updateValues.push(name);
            }
            if (email) {
                updateFields.push('email = ?');
                updateValues.push(email);
            }
            if (role) {
                updateFields.push('role = ?');
                updateValues.push(role);
            }
            if (sequence !== undefined) {
                updateFields.push('sequence = ?');
                updateValues.push(sequence);
            }

            if (updateFields.length > 0) {
                const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
                await connection.query(query, [...updateValues, id]);
            }

            await connection.commit();

            // Buscar usuário atualizado
            const [updatedUser] = await pool.query<RowDataPacket[]>(
                'SELECT id, name, email, role, sequence FROM users WHERE id = ?',
                [id]
            );

            res.json(updatedUser[0]);
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// Deletar usuário
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query<RowDataPacket[] & { affectedRows: number }>(
            'DELETE FROM users WHERE id = ?',
            [req.params.id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        
        res.status(204).send();
    } catch (error) {
        console.error('Erro ao deletar usuário:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

export { router }; 