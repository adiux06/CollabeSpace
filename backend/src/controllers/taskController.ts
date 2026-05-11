import { Request, Response, NextFunction } from 'express';
import { Task } from '../models/Task';
import { AppError } from '../utils/errorHandler';

export const createTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, status, priority, workspaceId, assignee, tags } = req.body;

    const count = await Task.countDocuments({ workspaceId, status });

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      workspaceId,
      assignee,
      tags,
      order: count,
      createdBy: req.user?._id
    });

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(workspaceId.toString()).emit('task-created', task);
    }

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

export const getTasks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { workspaceId, cursor, limit = 20, search, myTasks } = req.query;

    if (!workspaceId && myTasks !== 'true') {
      return next(new AppError('Workspace ID is required unless fetching My Tasks', 400));
    }

    const query: any = {};
    const conditions: any[] = [];
    
    if (workspaceId) {
      conditions.push({ workspaceId });
    }
    
    if (myTasks === 'true') {
      conditions.push({
        $or: [
          { assignee: req.user?._id },
          { createdBy: req.user?._id }
        ]
      });
    }
    
    if (search) {
      conditions.push({
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      });
    }

    if (cursor) {
      conditions.push({ _id: { $gt: cursor } });
    }

    const finalQuery = conditions.length > 0 ? { $and: conditions } : {};

    const tasks = await Task.find(finalQuery)
      .sort({ status: 1, order: 1, _id: 1 })
      .limit(Number(limit))
      .populate('assignee', 'name email avatar')
      .populate('workspaceId', 'name');

    const nextCursor = tasks.length === Number(limit) ? tasks[tasks.length - 1]._id : null;

    res.json({
      tasks,
      nextCursor
    });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const task = await Task.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

    if (!task) {
      return next(new AppError('Task not found', 404));
    }

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(task.workspaceId.toString()).emit('task-updated', task);
    }

    res.json(task);
  } catch (error) {
    next(error);
  }
};

export const updateTaskOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { taskId, sourceStatus, destinationStatus, sourceIndex, destinationIndex, workspaceId } = req.body;

    // This is a simplified approach. Ideally we would use bulkWrite for better performance.
    const task = await Task.findById(taskId);
    if (!task) return next(new AppError('Task not found', 404));

    if (sourceStatus === destinationStatus) {
      // Reordering in same column
      const tasks = await Task.find({ workspaceId, status: sourceStatus }).sort({ order: 1 });
      const [moved] = tasks.splice(sourceIndex, 1);
      tasks.splice(destinationIndex, 0, moved);

      const bulkOps = tasks.map((t, index) => ({
        updateOne: {
          filter: { _id: t._id },
          update: { order: index }
        }
      }));
      await Task.bulkWrite(bulkOps);
    } else {
      // Moving between columns
      const sourceTasks = await Task.find({ workspaceId, status: sourceStatus }).sort({ order: 1 });
      const destTasks = await Task.find({ workspaceId, status: destinationStatus }).sort({ order: 1 });

      const [moved] = sourceTasks.splice(sourceIndex, 1);
      moved.status = destinationStatus;
      destTasks.splice(destinationIndex, 0, moved);

      const sourceOps = sourceTasks.map((t, index) => ({
        updateOne: { filter: { _id: t._id }, update: { order: index } }
      }));
      const destOps = destTasks.map((t, index) => ({
        updateOne: { filter: { _id: t._id }, update: { status: destinationStatus, order: index } }
      }));

      await Task.bulkWrite([...sourceOps, ...destOps]);
    }

    // Fetch updated task and emit event
    const updatedTask = await Task.findById(taskId);
    const io = req.app.get('io');
    if (io) {
      io.to(workspaceId.toString()).emit('task-moved', { taskId, sourceStatus, destinationStatus, sourceIndex, destinationIndex });
    }

    res.json({ message: 'Order updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return next(new AppError('Task not found', 404));
    }

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(task.workspaceId.toString()).emit('task-deleted', task._id);
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const duplicateTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const originalTask = await Task.findById(id);

    if (!originalTask) {
      return next(new AppError('Task not found', 404));
    }

    const count = await Task.countDocuments({ 
      workspaceId: originalTask.workspaceId, 
      status: originalTask.status 
    });

    const newTask = await Task.create({
      title: `${originalTask.title} (Copy)`,
      description: originalTask.description,
      status: originalTask.status,
      priority: originalTask.priority,
      workspaceId: originalTask.workspaceId,
      assignee: originalTask.assignee,
      tags: originalTask.tags,
      subtasks: originalTask.subtasks.map(s => ({ title: s.title, completed: false })),
      order: count,
      createdBy: req.user?._id
    });

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(newTask.workspaceId.toString()).emit('task-created', newTask);
    }

    res.status(201).json(newTask);
  } catch (error) {
    next(error);
  }
};

export const getAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { workspaceId } = req.query;

    const stats = await Task.aggregate([
      { $match: { workspaceId: new (require('mongoose').Types.ObjectId)(workspaceId as string) } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const totalTasks = stats.reduce((acc, curr) => acc + curr.count, 0);
    const doneTasks = stats.find(s => s._id === 'Done')?.count || 0;
    const completionRate = totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0;

    res.json({
      stats,
      totalTasks,
      completionRate: Math.round(completionRate)
    });
  } catch (error) {
    next(error);
  }
};
