import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { RowDataPacket } from 'mysql2';
import pool from '../config/database';

const router = express.Router();

// Login
router.post('/login', (async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    console.log('Tentativa de login:', { email }); // Log para debug

    if (!email || !password) {
        res.status(400).json({ message: 'Email e senha são obrigatórios' });
        return;
    }

    try {
        console.log('Buscando usuário no banco...');
        const [users] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        console.log('Usuário encontrado:', users.length > 0); // Log para debug

        if (users.length === 0) {
            res.status(401).json({ message: 'Credenciais inválidas' });
            return;
        }

        const user = users[0];
        console.log('Dados do usuário:', { id: user.id, email: user.email, role: user.role });
        
        // Comparar a senha diretamente com a senha do banco
        const validPassword = user.password === password;
        console.log('Senha fornecida:', password);
        console.log('Senha no banco:', user.password);
        console.log('Senha válida:', validPassword); // Log para debug

        if (!validPassword) {
            res.status(401).json({ message: 'Credenciais inválidas' });
            return;
        }

        console.log('Gerando token...');
        const token = jwt.sign(
            { 
                id: user.id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET || 'default_secret',
            { expiresIn: '24h' }
        );
        console.log('Token gerado com sucesso');

        // Não enviar a senha no response
        const { password: _, ...userWithoutPassword } = user;

        console.log('Enviando resposta...');
        res.json({
            user: userWithoutPassword,
            token
        });
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        if (error instanceof Error) {
            console.error('Stack do erro:', error.stack);
        }
        res.status(500).json({ 
            message: 'Erro interno do servidor',
            error: error instanceof Error ? error.message : 'Erro desconhecido',
            stack: error instanceof Error ? error.stack : undefined
        });
    }
}) as express.RequestHandler);

// Verificar token
router.get('/verify', (async (req: Request, res: Response): Promise<void> => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        res.status(401).json({ message: 'Token não fornecido' });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as { id: string };
        
        const [users] = await pool.query<RowDataPacket[]>(
            'SELECT id, name, email, role FROM users WHERE id = ?',
            [decoded.id]
        );

        if (users.length === 0) {
            res.status(401).json({ message: 'Usuário não encontrado' });
            return;
        }

        res.json({ user: users[0] });
    } catch (error) {
        res.status(403).json({ message: 'Token inválido' });
    }
}) as express.RequestHandler);

export default router; 