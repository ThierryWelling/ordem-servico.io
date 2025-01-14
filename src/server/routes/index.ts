import { Router } from 'express';
import { router as authRouter } from './auth';
import { router as usersRouter } from './users';
import { router as serviceOrdersRouter } from './serviceOrders';
import { router as activitiesRouter } from './activities';
import { router as chatRouter } from './chat';
import { router as checklistRouter } from './checklist';

const router = Router();

router.use('/auth', authRouter);
router.use('/users', usersRouter);
router.use('/service-orders', serviceOrdersRouter);
router.use('/activities', activitiesRouter);
router.use('/chat', chatRouter);
router.use('/checklist', checklistRouter);

export { router }; 