import { Router, Request, Response } from 'express';
import { TransactionService } from '../services/TransactionService';

const router = Router();
const transactionService = new TransactionService();

// POST /api/transactions
router.post('/', async (req: Request, res: Response) => {
  try {
    const { amount, description, type, accountId, date } = req.body;

    if (!amount || !description || !type || !accountId || !date) {
      return res.status(400).json({ error: "Campos obrigatórios ausentes." });
    }

    const transaction = await transactionService.createTransaction({
      amount: parseFloat(amount),
      description,
      type,
      accountId: parseInt(accountId),
      date: new Date(date)
    });

    return res.status(201).json(transaction);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Erro ao criar transação." });
  }
});

// GET /api/transactions/user/:userId
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) return res.status(400).json({ error: "ID inválido." });

    const transactions = await transactionService.getTransactionsByUser(userId);
    return res.status(200).json(transactions);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar transações." });
  }
});

// PUT /api/transactions/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "ID inválido." });

    const transaction = await transactionService.updateTransaction(id, req.body);
    return res.status(200).json(transaction);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// DELETE /api/transactions/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "ID inválido." });

    await transactionService.deleteTransaction(id);
    return res.status(200).json({ message: "Transação deletada e saldo estornado." });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;