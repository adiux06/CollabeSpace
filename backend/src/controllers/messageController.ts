import { Request, Response, NextFunction } from 'express';
import { Message } from '../models/Message';
import { AppError } from '../utils/errorHandler';

export const getMessages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { workspaceId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;

    const messages = await Message.find({ workspaceId: workspaceId as any })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('sender', 'name email avatar');

    // Return in chronological order for the chat UI
    res.json(messages.reverse());
  } catch (error) {
    next(error);
  }
};

export const createMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { workspaceId } = req.params;
    const { text } = req.body;

    if (!text) {
      return next(new AppError('Message text is required', 400));
    }

    const message = await Message.create({
      text,
      sender: req.user?._id,
      workspaceId: workspaceId as any
    });

    const populatedMessage = await Message.findById(message._id).populate('sender', 'name email avatar');

    if (!populatedMessage) {
      return next(new AppError('Message creation failed', 500));
    }

    // Emit socket event to the workspace room
    const io = req.app.get('io');
    if (io) {
      io.to(workspaceId as string).emit('new-message', populatedMessage);
    }

    res.status(201).json(populatedMessage);
  } catch (error) {
    next(error);
  }
};
