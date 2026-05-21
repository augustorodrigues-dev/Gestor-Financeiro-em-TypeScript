// backend/prisma/seed.ts
import { prisma } from './prisma';
import bcrypt from 'bcrypt';

async function main() {
  console.log('🧹 Limpando o banco de dados...');
  await prisma.transaction.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('1234', 10);

  console.log('🌱 Semeando os dados...');

    const jadao = await prisma.user.create({
    data: {
      name: 'Jadão o Liso',
      email: 'jadao@gmail.com',
      passwordHash: passwordHash,
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
    },
    include: { accounts: { include: { transactions: true } } }
  });

  const jadaoAcc = jadao.accounts[0];
  const jadaoBalance = jadaoAcc.transactions.reduce(
   (acc, tx) => (tx.type === 'INCOME' ? acc + Number(tx.amount) : acc - Number(tx.amount)), 0);
   await prisma.account.update({ where: { id: jadaoAcc.id }, data: { balance: jadaoBalance } });


  const nando = await prisma.user.create({
    data: {
      name: 'DevOps Nando',
      email: 'nando@gmail.com',
      passwordHash: passwordHash,
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
    },
    include: { accounts: { include: { transactions: true } } }
  });

  const nandoAcc = nando.accounts[0];
  const nandoBalance = nandoAcc.transactions.reduce(
  (acc, tx) => (tx.type === 'INCOME' ? acc + Number(tx.amount) : acc - Number(tx.amount)), 
  0
);
await prisma.account.update({ where: { id: nandoAcc.id }, data: { balance: nandoBalance } });
  console.log('✅ Banco de dados populado com sucesso com Jadão e DevOpsNando!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });