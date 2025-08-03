// src/routes/pushNotification.routes.ts
import { Router } from 'express';
import { pushNotificationController } from '../controllers/pushNotification.controller';

const router = Router();

router.post('/pushNotifications', (req, res) => pushNotificationController.sendTestPush(req, res));

export default router;
