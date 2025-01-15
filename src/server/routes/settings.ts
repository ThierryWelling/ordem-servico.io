import express from 'express';
import { Request, Response } from 'express';
import { SystemSettings } from '../../types';
import db from '../database/index';
import uploadMiddleware from '../middleware/uploadMiddleware';

const router = express.Router();

interface MulterRequest extends Request {
    file?: Express.Multer.File;
}

router.post('/logo', uploadMiddleware as unknown as express.RequestHandler, async (req: MulterRequest, res: Response) => {
    try {
        if (!req.file) {
            res.status(400).json({ message: 'Nenhum arquivo enviado' });
            return;
        }

        const settings = await db.query<SystemSettings>(
            'UPDATE system_settings SET company_logo = ? WHERE id = 1 RETURNING *',
            [req.file.filename]
        );

        res.json(settings[0]);
    } catch (error) {
        console.error('Erro ao atualizar logo:', error);
        res.status(500).json({ message: 'Erro ao atualizar logo' });
    }
});

export default router; 