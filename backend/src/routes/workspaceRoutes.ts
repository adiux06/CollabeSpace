import express from 'express';
import { createWorkspace, getWorkspaces, getWorkspaceDetails, inviteMember } from '../controllers/workspaceController';
import { protect } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/rbacMiddleware';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(createWorkspace)
  .get(getWorkspaces);

router.route('/:id')
  .get(getWorkspaceDetails);

router.post('/:workspaceId/invite', requireRole(['admin']), inviteMember);

export default router;
