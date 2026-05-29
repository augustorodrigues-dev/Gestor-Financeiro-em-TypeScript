import { prisma } from './prisma';
import bcrypt from 'bcrypt';

async function main() {
  console.log('🧹 Limpando o banco de dados e reiniciando os contadores de ID...');
  
  try {
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Transaction" RESTART IDENTITY CASCADE;');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Account" RESTART IDENTITY CASCADE;');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "User" RESTART IDENTITY CASCADE;');
  } catch (error) {
    console.log('Tentando limpeza alternativa com letras minúsculas...');
    try {
      await prisma.$executeRawUnsafe('TRUNCATE TABLE "transaction" RESTART IDENTITY CASCADE;');
      await prisma.$executeRawUnsafe('TRUNCATE TABLE "account" RESTART IDENTITY CASCADE;');
      await prisma.$executeRawUnsafe('TRUNCATE TABLE "user" RESTART IDENTITY CASCADE;');
    } catch (fallbackError) {
      await prisma.transaction.deleteMany();
      await prisma.account.deleteMany();
      await prisma.user.deleteMany();
      console.log('Aviso: Dados apagados via deleteMany, os IDs podem não ter iniciado em 1.');
    }
  }

  const passwordHash = await bcrypt.hash('1234', 10);

  console.log('🌱 Semeando os dados...');

  const jadao = await prisma.user.create({
    data: {
      name: 'Jadão o Liso',
      email: 'jadao@gmail.com',
      passwordHash: passwordHash,
      role: 'USER', 
      accounts: {
        create: {
          name: 'Banco Inter',
          type: 'CORRENTE',
          balance: 0, 
          transactions: {
            create: [
              { description: 'Salário da Accenture', amount: 3500.00, type: 'INCOME', date: new Date() },
              { description: 'Mensalidade do Cesupa', amount: 1800.00, type: 'EXPENSE', date: new Date() },
              { description: 'Skin do LoL', amount: 75.00, type: 'EXPENSE', date: new Date() },
              { description: 'Netflix', amount: 39.90, type: 'EXPENSE', date: new Date() }
            ]
          }
        }
      }
    }
  });

  const jadaoAcc = await prisma.account.findFirst({
    where: { userId: jadao.id },
    include: { transactions: true }
  });

  if (jadaoAcc) {
    const jadaoBalance = jadaoAcc.transactions.reduce(
      (acc: number, tx: any) => (tx.type === 'INCOME' ? acc + Number(tx.amount) : acc - Number(tx.amount)), 
      0
    );
    await prisma.account.update({ where: { id: jadaoAcc.id }, data: { balance: jadaoBalance } });
  }


  const nando = await prisma.user.create({
    data: {
      name: 'DevOps Nando',
      email: 'nando@gmail.com',
      passwordHash: passwordHash,
      role: 'USER', 
      accounts: {
        create: {
          name: 'Nubank',
          type: 'CORRENTE',
          balance: 0, 
          transactions: {
            create: [
              { description: 'Mesada', amount: 5000.00, type: 'INCOME', date: new Date() },
              { description: 'Camisa do Papão', amount: 250.00, type: 'EXPENSE', date: new Date() },
              { description: 'Mensalidade', amount: 1500.00, type: 'EXPENSE', date: new Date() },
              { description: 'Skol Beats', amount: 120.00, type: 'EXPENSE', date: new Date() },
              { description: 'Prime Video', amount: 19.90, type: 'EXPENSE', date: new Date() }
            ]
          }
        }
      }
    }
  });

  const nandoAcc = await prisma.account.findFirst({
    where: { userId: nando.id },
    include: { transactions: true }
  });

  if (nandoAcc) {
    const nandoBalance = nandoAcc.transactions.reduce(
      (acc: number, tx: any) => (tx.type === 'INCOME' ? acc + Number(tx.amount) : acc - Number(tx.amount)), 
      0
    );
    await prisma.account.update({ where: { id: nandoAcc.id }, data: { balance: nandoBalance } });
  }


  // Dados de domínio para o Jadão (categorias, cartão e meta) — UC05/UC08/UC09
  await prisma.category.createMany({
    data: [
      { name: 'Alimentação', type: 'EXPENSE', icon: '🍔', color: '#ef4444', isDefault: true, userId: jadao.id },
      { name: 'Salário', type: 'INCOME', icon: '💰', color: '#10b981', isDefault: true, userId: jadao.id },
      { name: 'Lazer', type: 'EXPENSE', icon: '🎮', color: '#6366f1', isDefault: false, userId: jadao.id },
    ],
  });

  await prisma.creditCard.create({
    data: { name: 'Inter Mastercard', limitAmount: 5000, closingDay: 20, dueDay: 28, userId: jadao.id },
  });

  await prisma.goal.create({
    data: { name: 'Reserva de Emergência', targetAmount: 10000, currentAmount: 2500, deadline: new Date('2026-12-31'), userId: jadao.id },
  });

  console.log('👑 Criando administradora Alexandra...');
  await prisma.user.create({
    data: {
      name: 'Alexandra Bargan',
      email: 'alexandra@gmail.com',
      passwordHash: passwordHash,
      role: 'ADMIN'
    }
  });

  console.log('✅ Banco de dados populado com sucesso com Jadão, DevOpsNando e Alexandra!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });