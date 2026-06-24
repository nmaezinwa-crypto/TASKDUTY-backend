import { Router } from 'express';
import { TaskController } from '../controllers/TaskController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// All task routes are protected
router.get('/', protect, TaskController.getTasks);
router.post('/', protect, TaskController.createTask);
router.put('/:id', protect, TaskController.updateTask);

// Soft delete
router.delete('/:id', protect, TaskController.deleteTask);

// Trash routes
router.get('/trash', protect, TaskController.getTrashedTasks);
router.put('/:id/restore', protect, TaskController.restoreTask);
router.delete('/:id/permanent', protect, TaskController.permanentDeleteTask);

export default router;