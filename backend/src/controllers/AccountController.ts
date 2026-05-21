import { Request, Response } from 'express';
import { AccountService } from '../services/AccountService';

const accountService = new AccountService();

export class AccountController {
  
  // POST /api/accounts
  async create(req: Request, res: Response) {
    try {
      const { name, balance, type, userId } = req.body;

      if (!name || !type || !userId) {
        return res.status(400).json({ error: "Os campos name, type e userId são obrigatórios." });
      }

      const account = await accountService.createAccount({ name, balance, type, userId });
      return res.status(201).json(account);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Erro interno ao criar conta." });
    }
  }

  // GET /api/accounts/user/:userId
  async getByUser(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ error: "ID de usuário inválido." });
      }

      const accounts = await accountService.getAccountsByUser(userId);
      return res.status(200).json(accounts);
    } catch (error: any) {
      return res.status(500).json({ error: "Erro ao buscar contas do usuário." });
    }
  }

  // PUT /api/accounts/:id
  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: "ID inválido." });

      const account = await accountService.updateAccount(id, req.body);
      return res.status(200).json(account);
    } catch (error: any) {
      return res.status(500).json({ error: "Erro ao atualizar conta." });
    }
  }

  // DELETE /api/accounts/:id
  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: "ID inválido." });

      await accountService.deleteAccount(id);
      return res.status(200).json({ message: "Conta excluída com sucesso." });
    } catch (error: any) {
      // Captura o erro customizado do service se a conta tiver transações
      return res.status(400).json({ error: error.message });
    }
  }
}