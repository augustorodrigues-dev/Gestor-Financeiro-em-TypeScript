import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

// 1. Configura a conexão nativa com o PostgreSQL
const pool = new Pool({ connectionString: process.env.DATABASE_URL as string });

// 2. Cria o adaptador oficial do Prisma
const adapter = new PrismaPg(pool);

// 3. Passa o adaptador para o PrismaClient (Exatamente o que a mensagem de erro exigiu)
const prisma = new PrismaClient({ adapter });

interface CreateTransactionDTO {
  amount: number;
  date: Date;
  dueDate?: Date;
  description: string;
  type: string;
  isCleared?: boolean;
  isRecurring?: boolean;
  recurrencePeriod?: string;
  accountId?: number;
  categoryId?: number;
  creditCardId?: number;
  budgetId?: number;
}

export class TransactionService {
  async createTransaction(data: CreateTransactionDTO) {
    return await prisma.transaction.create({ data });
  }

  async getTransactionsByUser(userId: number) {
    return await prisma.transaction.findMany({
      where: {
        OR: [
          { account: { userId: userId } },
          { creditCard: { userId: userId } }
        ]
      },
      orderBy: { date: 'desc' },
    });
  }

  async updateTransaction(id: number, data: Partial<CreateTransactionDTO>) {
    return await prisma.transaction.update({ where: { id }, data });
  }

  async deleteTransaction(id: number) {
    return await prisma.transaction.delete({ where: { id } });
  }
}