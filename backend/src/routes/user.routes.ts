// src/routes/userRoutes.ts
import { Router } from 'express';
import { UserController } from '../controllers/UserController'; 

const router = Router();
const userController = new UserController();

router.post('/register', (req, res) => userController.create(req, res));

// 🚀 AQUI: Adicionando a rota de login que estava faltando!
router.post('/login', (req, res) => userController.login(req, res));

router.get('/', (req, res) => userController.listAll(req, res));

// 🔄 Novas rotas do CRUD de Admin mapeadas com :id
router.put('/:id', (req, res) => userController.update(req, res));
router.delete('/:id', (req, res) => userController.delete(req, res));

export default router;