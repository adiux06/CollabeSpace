import express from 'express';
import { chatWithAI } from '../controllers/aiController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/chat', protect, chatWithAI);

export default router;
