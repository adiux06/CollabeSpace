import express from 'express';
import { 
  createWorkspace, 
  getWorkspaces, 
  getWorkspaceDetails, 
  inviteMember,
  updateMemberRole,
  removeMember
} from '../controllers/workspaceController';
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
router.patch('/:workspaceId/members/:userId', requireRole(['admin']), updateMemberRole);
router.delete('/:workspaceId/members/:userId', requireRole(['admin']), removeMember);

export default router;
