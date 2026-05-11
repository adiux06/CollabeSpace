import { Request, Response, NextFunction } from 'express';
import { Comment } from '../models/Comment';
import { Task } from '../models/Task';
import { AppError } from '../utils/errorHandler';

export const addComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { text, taskId } = req.body;

    const task = await Task.findById(taskId);
    if (!task) return next(new AppError('Task not found', 404));

    const comment = await Comment.create({
      text,
      taskId,
      userId: req.user?._id
    });

    await comment.populate('userId', 'name avatar');

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(task.workspaceId.toString()).emit('new-comment', { taskId, comment });
    }

    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
};

export const getTaskComments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { taskId } = req.params;

    const comments = await Comment.find({ taskId })
      .sort({ createdAt: 1 })
      .populate('userId', 'name avatar');

    res.json(comments);
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findById(id);

    if (!comment) return next(new AppError('Comment not found', 404));

    // Only allow deletion by author (or maybe admin, but for now just author)
    if (comment.userId.toString() !== req.user?._id.toString()) {
      return next(new AppError('Not authorized to delete this comment', 403));
    }

    await Comment.findByIdAndDelete(id);

    // Emit socket event
    const task = await Task.findById(comment.taskId);
    const io = req.app.get('io');
    if (io && task) {
      io.to(task.workspaceId.toString()).emit('comment-deleted', { taskId: comment.taskId, commentId: id });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
