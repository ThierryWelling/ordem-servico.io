import express, { Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import serviceOrdersService from '../services/serviceOrdersService';

const router = express.Router();

// Lista todas as ordens de serviço
router.get('/', authenticateToken, (async (_req: Request, res: Response): Promise<void> => {
    try {
        const serviceOrders = await serviceOrdersService.getAllServiceOrders();
        res.json(serviceOrders);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar ordens de serviço' });
    }
}) as express.RequestHandler);

// Busca uma ordem de serviço específica
router.get('/:id', authenticateToken, (async (req: Request, res: Response): Promise<void> => {
    try {
        const serviceOrder = await serviceOrdersService.getServiceOrderById(req.params.id);
        if (!serviceOrder) {
            res.status(404).json({ message: 'Ordem de serviço não encontrada' });
            return;
        }
        res.json(serviceOrder);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar ordem de serviço' });
    }
}) as express.RequestHandler);

// Cria uma nova ordem de serviço
router.post('/', authenticateToken, (async (req: Request, res: Response): Promise<void> => {
    try {
        const serviceOrder = await serviceOrdersService.createServiceOrder(req.body);
        res.status(201).json(serviceOrder);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao criar ordem de serviço' });
    }
}) as express.RequestHandler);

// Atualiza uma ordem de serviço
router.put('/:id', authenticateToken, (async (req: Request, res: Response): Promise<void> => {
    try {
        const serviceOrder = await serviceOrdersService.updateServiceOrder(req.params.id, req.body);
        if (!serviceOrder) {
            res.status(404).json({ message: 'Ordem de serviço não encontrada' });
            return;
        }
        res.json(serviceOrder);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar ordem de serviço' });
    }
}) as express.RequestHandler);

// Exclui uma ordem de serviço
router.delete('/:id', authenticateToken, (async (req: Request, res: Response): Promise<void> => {
    try {
        const success = await serviceOrdersService.deleteServiceOrder(req.params.id);
        if (!success) {
            res.status(404).json({ message: 'Ordem de serviço não encontrada' });
            return;
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Erro ao excluir ordem de serviço' });
    }
}) as express.RequestHandler);

export default router; 