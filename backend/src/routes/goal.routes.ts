import { Router } from 'express';
import { GoalController } from '../controllers/GoalController';
import { authMiddleware } from '../middlewares/authMiddleware'; 

const router = Router();
const goalController = new GoalController();

router.use(authMiddleware);

router.post('/', (req, res) => goalController.create(req, res));
router.get('/', (req, res) => goalController.list(req, res));
router.put('/:id', (req, res) => goalController.update(req, res));
router.delete('/:id', (req, res) => goalController.delete(req, res));

export default router;