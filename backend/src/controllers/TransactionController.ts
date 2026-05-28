import { Request, Response } from 'express';
import { TransactionService } from '../services/TransactionService';

const transactionService = new TransactionService();

export class TransactionController {
  
  async create(req: Request, res: Response) {
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
  }

  async list(req: Request, res: Response) {
    try {
      const userId = req.user.id; 
      const transactions = await transactionService.getTransactionsByUser(userId);
      return res.status(200).json(transactions);
    } catch (error: any) {
      return res.status(500).json({ error: "Erro ao buscar transações." });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: "ID inválido." });

      const transaction = await transactionService.updateTransaction(id, req.body);
      return res.status(200).json(transaction);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: "ID inválido." });

      await transactionService.deleteTransaction(id);
      return res.status(200).json({ message: "Transação deletada com sucesso." });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}