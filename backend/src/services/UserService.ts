import { prisma } from '../prisma'; 
import bcrypt from 'bcrypt';

export interface CreateUserDTO {
  name: string;
  email: string;
  password?: string; 
  role?: 'USER' | 'ADMIN'; 
}

export class UserService {
  
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
}