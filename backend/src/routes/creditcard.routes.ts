import { Router } from 'express';
import { CreditCardController } from '../controllers/CreditCardController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
const controller = new CreditCardController();

router.use(authMiddleware);

router.post('/', (req, res) => controller.create(req, res));
router.get('/', (req, res) => controller.list(req, res));
router.put('/:id', (req, res) => controller.update(req, res));
router.delete('/:id', (req, res) => controller.delete(req, res));

export default router;
