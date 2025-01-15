import express, { Request, Response } from 'express';
import { Activity } from '../../types';
import { authenticateToken } from '../middleware/auth';
import activitiesService from '../services/activitiesService';

const router = express.Router();

// Lista todas as atividades
router.get('/', authenticateToken, (async (_req: Request, res: Response): Promise<void> => {
    try {
        const activities = await activitiesService.getAllActivities();
        res.json(activities);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar atividades' });
    }
}) as express.RequestHandler);

// Cria uma nova atividade
router.post('/', authenticateToken, (async (req: Request<{}, {}, Activity>, res: Response): Promise<void> => {
    try {
        const activity = await activitiesService.createActivity(req.body);
        res.status(201).json(activity);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao criar atividade' });
    }
}) as express.RequestHandler);

export default router; 