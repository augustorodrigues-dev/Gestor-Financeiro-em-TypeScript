import { prisma } from '../prisma';

export class TransactionService {
  

async createTransaction(data: { 
  amount: number; 
  description: string; 
  type: string; 
  accountId: number; 
  categoryId?: number; 
  date: Date | string; 
  creditCardId?: number | null 
}) {
  const finalType = data.creditCardId ? 'EXPENSE' : data.type;
  const amountToUpdate = data.creditCardId ? 0 : (finalType === 'INCOME' ? data.amount : -data.amount);

  const [newTransaction] = await prisma.$transaction([
    prisma.transaction.create({
      data: {
        amount: data.amount,
        description: data.description,
        type: finalType,
        accountId: data.accountId,
        categoryId: data.categoryId || null, // Se não vier nada, salva como null
        date: new Date(data.date),
        creditCardId: data.creditCardId ? Number(data.creditCardId) : null
      }
    }),
    prisma.account.update({
      where: { id: data.accountId },
      data: { balance: { increment: amountToUpdate } }
    })
  ]);

  return newTransaction;
}

  async getTransactionsByUser(userId: number) {
    return await prisma.transaction.findMany({
      where: {
        account: {
          userId: userId
        }
      },
      include: {
        account: {
          select: { name: true, type: true } 
        },
        creditCard: {
          select: { name: true } 
        }
      },
      orderBy: {
        date: 'desc' 
      }
    });
  }

  async updateTransaction(id: number, data: any) {
    const finalType = data.creditCardId ? 'EXPENSE' : data.type;

    return await prisma.transaction.update({
      where: { id },
      data: {
        description: data.description,
        amount: Number(data.amount),
        type: finalType,
        accountId: Number(data.accountId),
        date: data.date ? new Date(data.date) : undefined,
        creditCardId: data.creditCardId ? Number(data.creditCardId) : null
      }
    });
  }

  async deleteTransaction(id: number) {
    const transaction = await prisma.transaction.findUnique({
      where: { id }
    });

    if (!transaction) throw new Error("Transação não encontrada.");

    const hasCreditCard = !!transaction.creditCardId;

    const amountToReverse = hasCreditCard ? 0 : (transaction.type === 'INCOME' 
          ? -Number(transaction.amount) 
          : Number(transaction.amount));

    const result = await prisma.$transaction([
      prisma.transaction.delete({
        where: { id }
      }),
      prisma.account.update({
        where: { id: transaction.accountId! },
        data: { balance: { increment: amountToReverse } }
      })
    ] as const); 

    return result[0];
  }
}