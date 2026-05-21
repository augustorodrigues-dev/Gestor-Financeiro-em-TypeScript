import { Router } from 'express';
import { AccountController } from '../controllers/AccountController';

const router = Router();
const accountController = new AccountController();

router.post('/', accountController.create);
router.get('/user/:userId', accountController.getByUser);
router.put('/:id', accountController.update);
router.delete('/:id', accountController.delete);

export default router;