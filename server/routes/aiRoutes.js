import { Router } from 'express';
import { askAI } from '../controllers/aiController.js';

const router = Router();

router.post('/chat', askAI);

export default router;
