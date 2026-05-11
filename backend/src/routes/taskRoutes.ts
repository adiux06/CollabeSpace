import express from 'express';
import { createTask, getTasks, updateTask, deleteTask, updateTaskOrder, getAnalytics, duplicateTask } from '../controllers/taskController';
import { protect } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/rbacMiddleware';

const router = express.Router();

router.use(protect);

// Basic Task CRUD
router.route('/')
  .post(requireRole(['admin', 'member']), createTask)
  .get(getTasks); // Viewer can get tasks

// Analytics
router.get('/analytics', getAnalytics);

// Reordering
router.post('/reorder', requireRole(['admin', 'member']), updateTaskOrder);

router.route('/:id')
  .put(requireRole(['admin', 'member']), updateTask)
  .delete(requireRole(['admin']), deleteTask); // Only admin can delete

router.post('/:id/duplicate', requireRole(['admin', 'member']), duplicateTask);

export default router;
