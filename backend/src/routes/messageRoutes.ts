import express from 'express';
import { getMessages, createMessage } from '../controllers/messageController';
import { protect } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/rbacMiddleware';

const router = express.Router();

router.use(protect);

// Anyone in the workspace (member, admin, viewer) can read/write messages
router.get('/:workspaceId', requireRole(['admin', 'member', 'viewer']), getMessages);
router.post('/:workspaceId', requireRole(['admin', 'member', 'viewer']), createMessage);

export default router;
