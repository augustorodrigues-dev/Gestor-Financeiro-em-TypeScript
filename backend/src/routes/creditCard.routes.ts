import { Router } from 'express';
import { CreditCardController } from '../controllers/CreditCardController';
import { authMiddleware } from '../middlewares/authMiddleware'; // Garante o UC08 (Usuário autenticado)

const router = Router();
const creditCardController = new CreditCardController();

// Todas as rotas de cartão exigem login seguro
router.use(authMiddleware);

router.post('/', (req, res) => creditCardController.create(req, res));
router.get('/', (req, res) => creditCardController.list(req, res));
router.put('/:id', (req, res) => creditCardController.update(req, res));
router.delete('/:id', (req, res) => creditCardController.delete(req, res));

export default router;