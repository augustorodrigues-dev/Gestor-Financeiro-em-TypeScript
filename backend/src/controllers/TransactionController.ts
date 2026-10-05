import { Request, Response } from 'express';
import { TransactionService } from '../services/TransactionService';

const transactionService = new TransactionService();

export class TransactionController {
  
  async create(req: Request, res: Response) {
    try {
      
      const { description, amount, type, accountId, date, creditCardId } = req.body;

      if (!description || !amount || !type || !accountId || !date) {
        return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos.' });
      }

      const transaction = await transactionService.createTransaction({
        description,
        amount: Number(amount),
        type,
        accountId: Number(accountId),
        date,
        creditCardId: creditCardId ? Number(creditCardId) : null 
      });

      return res.status(201).json(transaction);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async list(req: Request, res: Response) {
    try {
      const userId = req.user.id; 
      
      const transactions = await transactionService.getTransactionsByUser(userId);
      
      return res.status(200).json(transactions);
    } catch (error: any) {
      return res.status(500).json({ error: 'Erro ao listar transações.' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      
      
      const transaction = await transactionService.updateTransaction(id, req.body);
      
      return res.status(200).json(transaction);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      await transactionService.deleteTransaction(id);
      
      return res.status(200).json({ message: 'Transação removida com sucesso.' });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}