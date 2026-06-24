import { Response } from 'express';
import { Task } from '../models/Task';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/authMiddleware';

export class TaskController {

  // Get all active (non-deleted) tasks
  static async getTasks(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { category, completed } = req.query;

      const filter: any = { 
        user: req.user?.id,
        deleted: false,
      };

      if (category) filter.category = category;
      if (completed !== undefined) filter.completed = completed === 'true';

      const tasks = await Task.find(filter)
        .sort({ dueDate: 1 })
        .select('-__v');

      res.status(200).json({
        success: true,
        count: tasks.length,
        tasks,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error fetching tasks',
        error: error.message,
      });
    }
  }

  // Create a new task
  static async createTask(req: AuthRequest, res: Response): Promise<void> {
    try {
      const taskData = {
        ...req.body,
        dueDate: new Date(req.body.dueDate),
        user: req.user?.id,
        deleted: false,
      };

      const task = new Task(taskData);
      const savedTask = await task.save();

      res.status(201).json({
        success: true,
        message: 'Task created successfully',
        task: savedTask,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: 'Error creating task',
        error: error.message,
      });
    }
  }

  // Update a task
  static async updateTask(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ success: false, message: 'Invalid task ID' });
        return;
      }

      const updateData = { ...req.body };
      if (updateData.dueDate) {
        updateData.dueDate = new Date(updateData.dueDate);
      }

      const updatedTask = await Task.findOneAndUpdate(
        { _id: id, user: req.user?.id, deleted: false },
        updateData,
        { new: true, runValidators: true }
      ).select('-__v');

      if (!updatedTask) {
        res.status(404).json({ success: false, message: 'Task not found' });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Task updated successfully',
        task: updatedTask,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: 'Error updating task',
        error: error.message,
      });
    }
  }

  // Soft delete a task
  static async deleteTask(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ success: false, message: 'Invalid task ID' });
        return;
      }

      const deletedTask = await Task.findOneAndUpdate(
        { _id: id, user: req.user?.id, deleted: false },
        { deleted: true, deletedAt: new Date() },
        { new: true }
      );

      if (!deletedTask) {
        res.status(404).json({ success: false, message: 'Task not found' });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Task moved to trash',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error deleting task',
        error: error.message,
      });
    }
  }

  // Get all deleted tasks (Trash)
  static async getTrashedTasks(req: AuthRequest, res: Response): Promise<void> {
    try {
      const tasks = await Task.find({
        user: req.user?.id,
        deleted: true,
      })
        .sort({ deletedAt: -1 })
        .select('-__v');

      res.status(200).json({
        success: true,
        count: tasks.length,
        tasks,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error fetching trashed tasks',
        error: error.message,
      });
    }
  }

  // Restore a task from trash
  static async restoreTask(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ success: false, message: 'Invalid task ID' });
        return;
      }

      const restoredTask = await Task.findOneAndUpdate(
        { _id: id, user: req.user?.id, deleted: true },
        { deleted: false, deletedAt: null },
        { new: true }
      );

      if (!restoredTask) {
        res.status(404).json({ success: false, message: 'Task not found in trash' });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Task restored successfully',
        task: restoredTask,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error restoring task',
        error: error.message,
      });
    }
  }

  // Permanently delete a task
  static async permanentDeleteTask(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ success: false, message: 'Invalid task ID' });
        return;
      }

      const deletedTask = await Task.findOneAndDelete({
        _id: id,
        user: req.user?.id,
        deleted: true,
      });

      if (!deletedTask) {
        res.status(404).json({ success: false, message: 'Task not found in trash' });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Task permanently deleted',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error permanently deleting task',
        error: error.message,
      });
    }
  }
}