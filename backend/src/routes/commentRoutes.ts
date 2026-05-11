import express from 'express';
import { addComment, getTaskComments, deleteComment } from '../controllers/commentController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect);

router.post('/', addComment);
router.get('/task/:taskId', getTaskComments);
router.delete('/:id', deleteComment);

export default router;
