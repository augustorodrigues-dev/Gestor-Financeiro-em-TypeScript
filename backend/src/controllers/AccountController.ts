import { Request, Response } from 'express';
import { AccountService } from '../services/AccountService';

const accountService = new AccountService();

export class AccountController {
  
  async create(req: Request, res: Response) {
    try {
      const userId = req.user.id; 
      const { name, type, balance } = req.body;

      if (!name || !type) {
        return res.status(400).json({ error: 'Nome e tipo da conta são obrigatórios.' });
      }

      const account = await accountService.createAccount(userId, { 
        name, 
        type, 
        balance: Number(balance) || 0 
      });
      
      return res.status(201).json(account);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async list(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      
      const accounts = await accountService.getAccountsByUser(userId);
      
      return res.status(200).json(accounts);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const accountId = parseInt(req.params.id);
      const data = req.body;

      if (isNaN(accountId)) {
         return res.status(400).json({ error: 'ID da conta inválido.' });
      }

      const updatedAccount = await accountService.updateAccount(accountId, userId, data);
      
      return res.status(200).json(updatedAccount);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const accountId = parseInt(req.params.id);

      if (isNaN(accountId)) {
         return res.status(400).json({ error: 'ID da conta inválido.' });
      }

      await accountService.deleteAccount(accountId, userId);
      
      return res.status(200).json({ message: 'Conta excluída com sucesso.' });
    } catch (error: any) {
      return res.status(400).json({ error: error.message }); 
    }
  }
}