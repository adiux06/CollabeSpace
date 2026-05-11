import { Request, Response, NextFunction } from 'express';
import { Workspace } from '../models/Workspace';
import { User } from '../models/User';
import { AppError } from '../utils/errorHandler';

export const createWorkspace = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description } = req.body;
    
    const workspace = await Workspace.create({
      name,
      description,
      createdBy: req.user?._id,
      members: [{ userId: req.user?._id, role: 'admin' }]
    });

    res.status(201).json(workspace);
  } catch (error) {
    next(error);
  }
};

export const getWorkspaces = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspaces = await Workspace.find({ 'members.userId': req.user?._id });
    res.json(workspaces);
  } catch (error) {
    next(error);
  }
};

export const getWorkspaceDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspace = await Workspace.findById(req.params.id)
      .populate('members.userId', 'name email');
    
    if (!workspace) {
      return next(new AppError('Workspace not found', 404));
    }

    res.json(workspace);
  } catch (error) {
    next(error);
  }
};

export const inviteMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, email, role } = req.body;
    const workspace = await Workspace.findById(req.params.workspaceId);

    if (!workspace) {
      return next(new AppError('Workspace not found', 404));
    }

    let inviteUserId = userId;

    if (email) {
      const user = await User.findOne({ email });
      if (!user) {
        return next(new AppError('User not found with this email', 404));
      }
      inviteUserId = user._id;
    }

    if (!inviteUserId) {
      return next(new AppError('User ID or email is required', 400));
    }

    if (workspace.members.some(m => m.userId.toString() === inviteUserId.toString())) {
      return next(new AppError('User is already a member', 400));
    }

    workspace.members.push({ userId: inviteUserId, role: role || 'member', joinedAt: new Date() } as any);
    await workspace.save();

    res.json(workspace);
  } catch (error) {
    next(error);
  }
};
