import { Router } from 'express';
import { AccountController } from '../controllers/AccountController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
const accountController = new AccountController();

router.use(authMiddleware);

router.post('/', accountController.create);
router.get('/', accountController.list);
router.put('/:id', accountController.update);
router.delete('/:id', accountController.delete);

export default router;