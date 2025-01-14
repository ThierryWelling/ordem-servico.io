import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { RowDataPacket } from 'mysql2';
import pool from '../config/database';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        role: string;
    };
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers['authorization'];
        console.log('Auth Header:', authHeader);
        
        const token = authHeader && authHeader.split(' ')[1];
        console.log('Token:', token);

        if (!token) {
            console.log('Token não fornecido');
            return res.status(401).json({ message: 'Token de autenticação não fornecido' });
        }

        try {
            console.log('Verificando token...');
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as { id: string; email: string; role: string };
            console.log('Token decodificado:', decoded);

            // Buscar usuário no banco de dados
            console.log('Buscando usuário no banco...');
            const [users] = await pool.query<RowDataPacket[]>(
                'SELECT id, role FROM users WHERE id = ?',
                [decoded.id]
            );
            console.log('Usuário encontrado:', users[0]);

            if (users.length === 0) {
                console.log('Usuário não encontrado no banco');
                return res.status(401).json({ message: 'Usuário não encontrado' });
            }

            req.user = {
                id: users[0].id,
                role: users[0].role
            };
            console.log('Usuário autenticado:', req.user);

            next();
        } catch (jwtError) {
            console.error('Erro ao verificar token:', jwtError);
            return res.status(403).json({ 
                message: 'Token inválido',
                error: jwtError instanceof Error ? jwtError.message : 'Erro desconhecido'
            });
        }
    } catch (error) {
        console.error('Erro no middleware de autenticação:', error);
        return res.status(500).json({ 
            message: 'Erro interno do servidor',
            error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
    }
};

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Acesso negado' });
    }

    next();
}; 