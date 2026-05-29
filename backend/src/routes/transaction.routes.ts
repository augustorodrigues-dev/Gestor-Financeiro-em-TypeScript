import { Router } from 'express';
import { TransactionController } from '../controllers/TransactionController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
const transactionController = new TransactionController();

router.use(authMiddleware);

router.post('/', (req, res) => transactionController.create(req, res));
router.get('/scheduled', (req, res) => transactionController.listScheduled(req, res));
router.get('/', (req, res) => transactionController.list(req, res));
router.put('/:id', (req, res) => transactionController.update(req, res));
router.delete('/:id', (req, res) => transactionController.delete(req, res));

export default router;