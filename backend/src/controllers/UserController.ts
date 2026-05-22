import { Request, Response } from 'express';
import { UserService } from '../services/UserService';

const userService = new UserService();

export class UserController {
  
  async create(req: Request, res: Response) {
    try {
      const { name, email, password, role } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ error: "Nome, e-mail e senha são obrigatórios." });
      }

      const user = await userService.createUser({ 
        name, 
        email, 
        password, 
        role: role || 'USER' 
      });
      
      return res.status(201).json({ message: "Usuário criado com sucesso!", user });
      
    } catch (error: any) {
      if (error.message === "Este e-mail já está cadastrado no sistema.") {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: "Erro interno ao cadastrar usuário." });
    }
  }

  async listAll(req: Request, res: Response) {
    try {
      const users = await userService.getAllUsers(); 
      return res.json(users);
    } catch (error: any) {
      return res.status(500).json({ error: "Erro interno ao listar usuários." });
    }
  }
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, role } = req.body;

      if (!name || !role) {
        return res.status(400).json({ error: "Nome e Role são obrigatórios." });
      }

      const updatedUser = await userService.updateUser(Number(id), { name, role });
      return res.json({ message: "Usuário atualizado com sucesso!", updatedUser });
    } catch (error: any) {
      return res.status(500).json({ error: "Erro interno ao atualizar usuário." });
    }
  }

  // 🗑️ DELETE DO CRUD
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await userService.deleteUser(Number(id));
      return res.json({ message: "Usuário excluído com sucesso!" });
    } catch (error: any) {
      return res.status(500).json({ error: "Erro interno ao excluir usuário." });
    }
  }
}