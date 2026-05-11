import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errorHandler';
import { Workspace } from '../models/Workspace';
import { Types } from 'mongoose';

export const requireRole = (roles: ('admin' | 'member' | 'viewer')[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const workspaceId = req.params?.workspaceId || req.body?.workspaceId;
      
      if (!workspaceId || !req.user) {
        return next(new AppError('Workspace ID and User are required', 400));
      }

      const workspace = await Workspace.findById(workspaceId);
      if (!workspace) {
        return next(new AppError('Workspace not found', 404));
      }

      const member = workspace.members.find(
        (m) => m.userId.toString() === req.user?._id.toString()
      );

      if (!member) {
        return next(new AppError('Not a member of this workspace', 403));
      }

      if (!roles.includes(member.role)) {
        return next(new AppError(`Role ${member.role} is not authorized to perform this action`, 403));
      }

      // Attach member role to request for later use
      (req as any).memberRole = member.role;
      next();
    } catch (error) {
      next(error);
    }
  };
};
