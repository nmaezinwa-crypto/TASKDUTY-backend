import { Response } from 'express';
import { Task } from '../models/Task';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/authMiddleware';

export class TaskController {

  static async getTasks(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { category, completed } = req.query;

      const filter: any = { user: req.user?.id };

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

  static async createTask(req: AuthRequest, res: Response): Promise<void> {
    try {
      const taskData = {
        ...req.body,
        dueDate: new Date(req.body.dueDate),
        user: req.user?.id,
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

      // Make sure user can only update their own tasks
      const updatedTask = await Task.findOneAndUpdate(
        { _id: id, user: req.user?.id },
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

  static async deleteTask(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ success: false, message: 'Invalid task ID' });
        return;
      }

      // Make sure user can only delete their own tasks
      const deletedTask = await Task.findOneAndDelete({
        _id: id,
        user: req.user?.id,
      });

      if (!deletedTask) {
        res.status(404).json({ success: false, message: 'Task not found' });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Task deleted successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error deleting task',
        error: error.message,
      });
    }
  }
}


























