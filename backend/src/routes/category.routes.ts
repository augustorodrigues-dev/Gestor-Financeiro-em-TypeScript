import { Router } from 'express';
import { CategoryController } from '../controllers/CategoryController';
import { authMiddleware } from '../middlewares/authMiddleware'; 

const router = Router();
const categoryController = new CategoryController();

router.use(authMiddleware);

router.post('/', (req, res) => categoryController.create(req, res));
router.get('/', (req, res) => categoryController.list(req, res));
router.put('/:id', (req, res) => categoryController.update(req, res));
router.delete('/:id', (req, res) => categoryController.delete(req, res));

export default router;