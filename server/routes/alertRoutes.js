import { Router } from 'express';
import { evaluateAlerts } from '../controllers/alertController.js';

const router = Router();

router.post('/evaluate', evaluateAlerts);

export default router;
