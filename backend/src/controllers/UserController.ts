import { Request, Response } from 'express';
import { UserService } from '../services/UserService';
import jwt from 'jsonwebtoken'; 
import bcrypt from 'bcrypt';

const userService = new UserService();

export class UserController {
  
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "E-mail e senha são obrigatórios." });
      }

      const user = await userService.getUserByEmail(email); 
      if (!user) {
        return res.status(401).json({ error: "E-mail ou senha inválidos." });
      }

      const passwordMatch = await bcrypt.compare(password, user.passwordHash);
      if (!passwordMatch) {
        return res.status(401).json({ error: "E-mail ou senha inválidos." });
      }

      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET || 'secret_padrao_aqui',
        { expiresIn: '1d' } 
      );

      
      return res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          role: user.role
        }
      });

    } catch (error: any) {
      return res.status(500).json({ error: "Erro interno ao realizar login." });
    }
  }
  
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

      
      
      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET || 'secret_padrao_aqui',
        { expiresIn: '1d' }
      );
      
      
      return res.status(201).json({ 
        message: "Usuário criado com sucesso!", 
        token, 
        user 
      });
      
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