import { Router } from 'express';
import { UserController } from '../controllers/UserController'; 

const router = Router();
const userController = new UserController(); 

router.post('/register', (req, res) => userController.create(req, res));
router.get('/', (req, res) => userController.listAll(req, res));

export default router;