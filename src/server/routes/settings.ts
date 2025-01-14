import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import settingsService from '../services/settingsService';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../../public/uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Tipo de arquivo inválido. Apenas JPEG, PNG e GIF são permitidos.'));
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

router.get('/themes', authenticateToken, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const themes = await settingsService.getAllThemes();
        res.json(themes);
    } catch (error) {
        next(error);
    }
});

router.post('/themes', authenticateToken, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const theme = await settingsService.createTheme(req.body);
        res.status(201).json(theme);
    } catch (error) {
        next(error);
    }
});

router.get('/', authenticateToken, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const settings = await settingsService.getSettings();
        res.json(settings);
    } catch (error) {
        next(error);
    }
});

router.put('/', authenticateToken, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const settings = await settingsService.updateSettings(req.body);
        res.json(settings);
    } catch (error) {
        next(error);
    }
});

router.post('/logo', authenticateToken, upload.single('logo'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.file) {
            res.status(400).json({ message: 'Nenhum arquivo enviado' });
            return;
        }

        const fileUrl = await settingsService.uploadCompanyLogo(req.file);
        res.json({ logo_url: fileUrl });
    } catch (error) {
        next(error);
    }
});

export { router }; 