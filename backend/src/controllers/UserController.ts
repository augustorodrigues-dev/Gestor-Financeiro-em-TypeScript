import { Request, Response } from 'express';
import { UserService } from '../services/UserService';
import jwt from 'jsonwebtoken'; // 🚀 IMPORTANTE: Para gerar o token do UC01
import bcrypt from 'bcrypt';

const userService = new UserService();

export class UserController {
  
  // 🚀 NOVO MÉTODO: Autenticar Usuário (UC01)
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "E-mail e senha são obrigatórios." });
      }

      // Busca o usuário no banco pelo e-mail
      const user = await userService.getUserByEmail(email); 
      if (!user) {
        return res.status(401).json({ error: "E-mail ou senha inválidos." });
      }

      // Compara o hash da senha usando bcrypt
      const passwordMatch = await bcrypt.compare(password, user.passwordHash);
      if (!passwordMatch) {
        return res.status(401).json({ error: "E-mail ou senha inválidos." });
      }

      // Gera o Token JWT com o ID e o papel (Role) do usuário
      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET || 'secret_padrao_aqui',
        { expiresIn: '1d' } // Expira em 1 dia
      );

      // Retorna exatamente no formato que o Front-end espera
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

      // 🔐 PARA O UC02 (Início de sessão automático): 
      // Vamos gerar um token direto no cadastro também para o usuário logar direto!
      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET || 'secret_padrao_aqui',
        { expiresIn: '1d' }
      );
      
      // Retornamos a mensagem, o usuário E o token
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

  // UC11 — Editar Perfil (usa o id do token JWT)
  async updateProfile(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const { name, email, password } = req.body;
      if (!name && !email && !password) {
        return res.status(400).json({ error: "Informe ao menos um campo para atualizar." });
      }
      const updated = await userService.updateProfile(userId, { name, email, password });
      return res.json({ message: "Perfil atualizado com sucesso!", user: updated });
    } catch (error: any) {
      if (error.message?.includes("já está em uso")) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: "Erro interno ao atualizar perfil." });
    }
  }

  // UC18 — Solicitar recuperação de senha
  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ error: "E-mail é obrigatório." });

      const token = await userService.generateResetToken(email);
      // Resposta genérica para não revelar quais e-mails existem (fluxo alternativo UC18)
      return res.json({
        message: "Se o e-mail estiver cadastrado, um link de redefinição será enviado.",
        // Em produção, o token iria por e-mail. Sem serviço de e-mail, expomos para o demo:
        resetToken: token || undefined,
      });
    } catch (error: any) {
      return res.status(500).json({ error: "Erro ao processar a solicitação." });
    }
  }

  // UC18 — Redefinir senha com o token
  async resetPassword(req: Request, res: Response) {
    try {
      const { token, password } = req.body;
      if (!token || !password) {
        return res.status(400).json({ error: "Token e nova senha são obrigatórios." });
      }
      await userService.resetPassword(token, password);
      return res.json({ message: "Senha redefinida com sucesso!" });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}