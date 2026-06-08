import { Router } from 'express';
import { ReportController } from '../controllers/ReportController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
const reportController = new ReportController();

router.get('/reports', authMiddleware, (req, res) => reportController.getMonthly(req, res));

export default router;