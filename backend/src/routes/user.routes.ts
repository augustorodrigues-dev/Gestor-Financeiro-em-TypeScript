
import { Router } from 'express';
import { UserController } from '../controllers/UserController'; 

const router = Router();
const userController = new UserController();

router.post('/register', (req, res) => userController.create(req, res));


router.post('/login', (req, res) => userController.login(req, res));

router.get('/', (req, res) => userController.listAll(req, res));


router.put('/:id', (req, res) => userController.update(req, res));
router.delete('/:id', (req, res) => userController.delete(req, res));

export default router;