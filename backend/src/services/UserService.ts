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
}