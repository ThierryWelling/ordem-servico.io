import express from 'express';
import cors from 'cors';
import path from 'path';
import { validateEnv } from './config/validateEnv';
import authRouter from './routes/auth';
import settingsRouter from './routes/settings';
import serviceOrderRouter from './routes/serviceOrders';
import activityRouter from './routes/activities';
import chatRouter from './routes/chat';
import userRouter from './routes/users';
import checklistRouter from './routes/checklist';

// Validar variáveis de ambiente antes de iniciar o servidor
validateEnv();

const app = express();

// Configurações de segurança básicas
app.disable('x-powered-by');
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

// Middlewares
app.use(express.json({ limit: process.env.MAX_FILE_SIZE }));
app.use(express.urlencoded({ extended: true, limit: process.env.MAX_FILE_SIZE }));

// Servir arquivos estáticos
const uploadsDir = path.join(__dirname, '..', process.env.UPLOAD_DIR || 'public/uploads');
app.use('/uploads', express.static(uploadsDir));

// Rotas
app.use('/api/auth', authRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/service-orders', serviceOrderRouter);
app.use('/api/activities', activityRouter);
app.use('/api/chat', chatRouter);
app.use('/api/users', userRouter);
app.use('/api/checklist', checklistRouter);

// Tratamento de erros
interface ApiError extends Error {
    status?: number;
    errors?: any[];
}

app.use((err: ApiError, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Erro:', {
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        errors: err.errors
    });

    res.status(err.status || 500).json({
        error: err.message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        ...(err.errors && { errors: err.errors })
    });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT} em modo ${process.env.NODE_ENV}`);
}); 