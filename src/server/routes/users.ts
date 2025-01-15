import express, { Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import usersService from '../services/usersService';

const router = express.Router();

// Lista todos os usuários
router.get('/', authenticateToken, (async (_req: Request, res: Response): Promise<void> => {
    try {
        const users = await usersService.getAllUsers();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar usuários' });
    }
}) as express.RequestHandler);

// Busca um usuário específico
router.get('/:id', authenticateToken, (async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await usersService.getUserById(req.params.id);
        if (!user) {
            res.status(404).json({ message: 'Usuário não encontrado' });
            return;
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar usuário' });
    }
}) as express.RequestHandler);

// Cria um novo usuário
router.post('/', authenticateToken, (async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await usersService.createUser(req.body);
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao criar usuário' });
    }
}) as express.RequestHandler);

// Atualiza um usuário
router.put('/:id', authenticateToken, (async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await usersService.updateUser(req.params.id, req.body);
        if (!user) {
            res.status(404).json({ message: 'Usuário não encontrado' });
            return;
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar usuário' });
    }
}) as express.RequestHandler);

// Exclui um usuário
router.delete('/:id', authenticateToken, (async (req: Request, res: Response): Promise<void> => {
    try {
        const success = await usersService.deleteUser(req.params.id);
        if (!success) {
            res.status(404).json({ message: 'Usuário não encontrado' });
            return;
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Erro ao excluir usuário' });
    }
}) as express.RequestHandler);

export default router; 