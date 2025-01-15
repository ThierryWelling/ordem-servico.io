import express from 'express';
import authRouter from './auth';
import usersRouter from './users';
import serviceOrdersRouter from './serviceOrders';
import activitiesRouter from './activities';
import chatRouter from './chat';
import checklistRouter from './checklist';
import settingsRouter from './settings';

const router = express.Router();

router.use('/auth', authRouter);
router.use('/users', usersRouter);
router.use('/service-orders', serviceOrdersRouter);
router.use('/activities', activitiesRouter);
router.use('/chat', chatRouter);
router.use('/checklist', checklistRouter);
router.use('/settings', settingsRouter);

export default router; 