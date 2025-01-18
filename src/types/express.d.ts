import { Multer } from 'multer';

declare global {
    namespace Express {
        interface Request {
            file?: Multer.File;
            user?: {
                id: string;
                role: string;
            };
        }
    }
} 