import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import authRouter from './routes/auth';
import settingsRouter from './routes/settings';
import serviceOrderRouter from './routes/serviceOrders';
import activityRouter from './routes/activities';
import chatRouter from './routes/chat';
import userRouter from './routes/users';
import checklistRouter from './routes/checklist';

dotenv.config();

const app = express();

// Configurações
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Rotas
app.use('/api/auth', authRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/service-orders', serviceOrderRouter);
app.use('/api/activities', activityRouter);
app.use('/api/chat', chatRouter);
app.use('/api/users', userRouter);
app.use('/api/checklist', checklistRouter);

// Tratamento de erros
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Erro interno do servidor' });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
}); 