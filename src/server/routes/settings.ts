import express from 'express';
import { Request, Response } from 'express';
import uploadMiddleware from '../middleware/uploadMiddleware';
import { SystemSettings } from '../../types';
import db from '../database/index';

const router = express.Router();

router.post('/logo', (req: Request, res: Response) => {
    uploadMiddleware(req as any, res as any, async (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }

        try {
            if (!req.file) {
                return res.status(400).json({ message: 'Nenhum arquivo enviado' });
            }

            const settings = await db.query<SystemSettings>(
                'UPDATE system_settings SET company_logo = ? WHERE id = 1 RETURNING *',
                [req.file.filename]
            );

            return res.json(settings[0]);
        } catch (error) {
            console.error('Erro ao atualizar logo:', error);
            return res.status(500).json({ message: 'Erro ao atualizar logo' });
        }
    });
});

export default router; 