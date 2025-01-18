import express from 'express';
import auth from './auth';
import users from './users';
import serviceOrders from './serviceOrders';
import activities from './activities';
import chat from './chat';
import checklist from './checklist';
import settings from './settings';

const router = express.Router();

router.use('/auth', auth);
router.use('/users', users);
router.use('/service-orders', serviceOrders);
router.use('/activities', activities);
router.use('/chat', chat);
router.use('/checklist', checklist);
router.use('/settings', settings);

export default router; 