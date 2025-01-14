import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { router as userRoutes } from './routes/users';
import { router as serviceOrderRoutes } from './routes/serviceOrders';
import { router as activityRoutes } from './routes/activities';
import { router as chatRoutes } from './routes/chat';
import { router as authRoutes } from './routes/auth';
import { authenticateToken } from './middleware/auth';
import { router as settingsRouter } from './routes/settings';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Rotas públicas
app.use('/api/auth', authRoutes);

// Middleware de autenticação para rotas protegidas
app.use('/api', authenticateToken);

// Rotas protegidas
app.use('/api/users', userRoutes);
app.use('/api/service-orders', serviceOrderRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/settings', settingsRouter);

// Tratamento de erros
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Erro interno do servidor' });
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
}); 