import { Request, Response } from 'express';
// CORREÇÃO 1: Importar a classe com letra MAIÚSCULA
import { TransactionService } from '../services/TransactionService';

// CORREÇÃO 2: Instanciar usando a classe correta
const transactionService = new TransactionService();

export class TransactionController {
  
  async create(req: Request, res: Response) {
    try {
      const data = req.body;

      // Validação super básica
      if (!data.amount || !data.date || !data.description || !data.type) {
        return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
      }

      // Convertendo strings de data para o formato DateTime do Prisma
      data.date = new Date(data.date);
      if (data.dueDate) data.dueDate = new Date(data.dueDate);

      const newTransaction = await transactionService.createTransaction(data);
      return res.status(201).json(newTransaction);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno ao criar transação.' });
    }
  }

  async list(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      
      const transactions = await transactionService.getTransactionsByUser(Number(userId));
      return res.status(200).json(transactions);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao buscar transações.' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body;

      if (data.date) data.date = new Date(data.date);
      if (data.dueDate) data.dueDate = new Date(data.dueDate);

      const updatedTransaction = await transactionService.updateTransaction(Number(id), data);
      return res.status(200).json(updatedTransaction);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao atualizar transação.' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      await transactionService.deleteTransaction(Number(id));
      return res.status(204).send();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao deletar transação.' });
    }
  }
}