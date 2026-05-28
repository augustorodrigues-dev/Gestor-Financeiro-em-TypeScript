import { Request, Response } from 'express';
import { AccountService } from '../services/AccountService';

const accountService = new AccountService();

export class AccountController {
  
  // CREATE (Criar Conta)
  async create(req: Request, res: Response) {
    try {
      // 🔐 A mágica da segurança: pegamos o ID de quem fez o login pelo Token!
      const userId = req.user.id; 
      const { name, type, balance } = req.body;

      if (!name || !type) {
        return res.status(400).json({ error: 'Nome e tipo da conta são obrigatórios.' });
      }

      // Passamos o userId garantindo que a conta será vinculada a ele
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

  // READ (Listar Contas)
  async list(req: Request, res: Response) {
    try {
      // 🔐 O Front-end não mandou o ID na URL, nós pegamos do Token
      const userId = req.user.id;
      
      // O Service vai no banco e busca SÓ as contas desse usuário específico
      const accounts = await accountService.getAccountsByUser(userId);
      
      return res.status(200).json(accounts);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  // UPDATE (Atualizar Conta)
  async update(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const accountId = parseInt(req.params.id);
      const data = req.body;

      if (isNaN(accountId)) {
         return res.status(400).json({ error: 'ID da conta inválido.' });
      }

      // Mandamos o userId junto para o Service garantir que o cara 
      // não está tentando editar a conta de outro usuário
      const updatedAccount = await accountService.updateAccount(accountId, userId, data);
      
      return res.status(200).json(updatedAccount);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  // DELETE (Excluir Conta)
  async delete(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const accountId = parseInt(req.params.id);

      if (isNaN(accountId)) {
         return res.status(400).json({ error: 'ID da conta inválido.' });
      }

      // O Service tenta deletar. Se tiver transações vinculadas (UC03), ele lança o erro
      await accountService.deleteAccount(accountId, userId);
      
      return res.status(200).json({ message: 'Conta excluída com sucesso.' });
    } catch (error: any) {
      // 🔴 É aqui que o back-end devolve a mensagem de erro que o Front-end vai mostrar na tela vermelha!
      return res.status(400).json({ error: error.message }); 
    }
  }
}