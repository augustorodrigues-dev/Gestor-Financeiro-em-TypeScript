import { prisma } from '../prisma'; 
import bcrypt from 'bcrypt';

export interface CreateUserDTO {
  name: string;
  email: string;
  password?: string; 
  role?: 'USER' | 'ADMIN'; 
}

export class UserService {
  
  // 🚀 NOVO MÉTODO: Auxiliar para o Controller de Login (UC01)
  async getUserByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email }
    });
  }
  
  async createUser(data: CreateUserDTO) {
    const userExists = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (userExists) {
      throw new Error("Este e-mail já está cadastrado no sistema.");
    }

    const passwordHash = data.password ? await bcrypt.hash(data.password, 10) : '';

    return await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: passwordHash,
        role: data.role || 'USER' 
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });
  }

  async getAllUsers() {
    return await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });
  }

  async updateUser(id: number, data: { name: string; role: 'USER' | 'ADMIN' }) {
    return await prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        role: data.role
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });
  }

  async deleteUser(id: number) {
    await prisma.transaction.deleteMany({
      where: { account: { userId: id } }
    });

    await prisma.account.deleteMany({
      where: { userId: id }
    });

    return await prisma.user.delete({
      where: { id }
    });
  }

  // UC11 — Editar Perfil (o próprio usuário atualiza nome/e-mail/senha)
  async updateProfile(id: number, data: { name?: string; email?: string; password?: string }) {
    if (data.email) {
      const existing = await prisma.user.findUnique({ where: { email: data.email } });
      if (existing && existing.id !== id) {
        throw new Error('Este e-mail já está em uso por outra conta.');
      }
    }

    const updateData: any = { name: data.name, email: data.email };
    if (data.password) {
      updateData.passwordHash = await bcrypt.hash(data.password, 10);
    }

    return await prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, name: true, email: true, role: true },
    });
  }

  // UC18 — Recuperação de Senha: gera token de redefinição (validade 1h)
  // Obs.: sem serviço de e-mail no projeto, o token é retornado para uso no fluxo de demo.
  async generateResetToken(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    // Mensagem genérica para e-mails inexistentes (fluxo alternativo do UC18)
    if (!user) return null;

    const token = Math.random().toString(36).slice(2) + Date.now().toString(36);
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetTokenExpires: expires },
    });

    return token;
  }

  // UC18 — Redefine a senha a partir de um token válido
  async resetPassword(token: string, newPassword: string) {
    const user = await prisma.user.findFirst({
      where: { resetToken: token, resetTokenExpires: { gte: new Date() } },
    });
    if (!user) throw new Error('Token inválido ou expirado.');

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, resetToken: null, resetTokenExpires: null },
    });

    return { id: user.id };
  }
}