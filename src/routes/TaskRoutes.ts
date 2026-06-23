import { Router } from 'express';
import { TaskController } from '../controllers/TaskController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// All task routes are protected
router.get('/', protect, TaskController.getTasks);
router.post('/', protect, TaskController.createTask);
router.put('/:id', protect, TaskController.updateTask);
router.delete('/:id', protect, TaskController.deleteTask);

export default router;






















// import { Router } from 'express';
// import { TaskController } from '../controllers/TaskController';

// export const router = Router();


// // GET /tasks - Get all tasks (with optional filters)
// router.get('/', TaskController.getTasks);

// // POST /tasks - Create a new task
// router.post('/', TaskController.createTask);

// // GET /tasks/:id - Get single task by ID
// // router.get('/tasks/:id', TaskController.getTaskById);

// // PUT /tasks/:id - Update a task
// router.put('/:id', TaskController.updateTask);

// // DELETE /tasks/:id - Delete a task
// router.delete('/:id', TaskController.deleteTask);

// export default router;