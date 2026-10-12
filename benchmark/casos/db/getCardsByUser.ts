import { CreditCardService } from '../../../backend/src/services/CreditCardService';
import { compararAproximado } from '../../lib/comparar';
import { aceitaClienteInjetado } from '../../lib/descoberta';
import { criarConta, criarUsuario, inserirEmLotes, limparTudo, valorEmCentavos } from '../../lib/seed';
import type { CasoDb, ContextoDb, Verificacao } from '../../lib/tiposDb';

const getCardsByUserLegado = async (db: any, userId: number) => {
  const cards = await db.creditCard.findMany({
    where: { userId },
    include: {
      transactions: true
    }
  });

  return cards.map((card: any) => {
    const limiteTotal = Number(card.limitAmount);

    const currentInvoice = card.transactions.reduce((acc: number, tx: any) => acc + Number(tx.amount), 0);
    const availableLimit = limiteTotal - currentInvoice;

    return {
      id: card.id,
      name: card.name,
      limitAmount: limiteTotal,
      closingDay: card.closingDay,
      dueDay: card.dueDay,
      userId: card.userId,
      currentInvoice,
      availableLimit
    };
  });
};

async function semear(prisma: any, totalCartoes: number, totalTransacoes: number) {
  await limparTudo(prisma);
  const usuario = await criarUsuario(prisma);
  const conta = await criarConta(prisma, usuario.id);

  await prisma.creditCard.createMany({
    data: Array.from({ length: totalCartoes }, (_, i) => ({
      name: `Cartao ${i + 1}`,
      limitAmount: 5000 + i,
      closingDay: 25,
      dueDay: 5,
      userId: usuario.id
    }))
  });

  const cartoes = await prisma.creditCard.findMany({
    where: { userId: usuario.id },
    select: { id: true },
    orderBy: { id: 'asc' }
  });

  const transacoes = Array.from({ length: totalTransacoes }, (_, i) => ({
    amount: valorEmCentavos(i),
    date: new Date(2026, 2, 1 + (i % 28)),
    description: `Compra ${i + 1}`,
    type: 'EXPENSE',
    accountId: conta.id,
    creditCardId: cartoes[i % cartoes.length].id
  }));

  await inserirEmLotes(transacoes, lote => prisma.transaction.createMany({ data: lote }));

  return { userId: usuario.id as number, accountId: conta.id as number };
}

export const casos: CasoDb[] = (['t_grande', 'c_proporcional'] as const).map(cenario => ({
  funcao: 'getCardsByUser',
  cenario,
  preparar: async (n, { prisma, cliente }) => {
    const totalCartoes = cenario === 't_grande' ? 5 : Math.ceil(n / 10);
    const { userId } = await semear(prisma, totalCartoes, n);
    const servico = new CreditCardService();
    return {
      antes: () => getCardsByUserLegado(cliente, userId),
      depois: () => servico.getCardsByUser(userId, cliente)
    };
  }
}));

export const verificacoes: Verificacao[] = [
  {
    nome: 'getCardsByUser: cartao sem transacoes e cartao com varias',
    executar: async ({ prisma, cliente }: ContextoDb) => {
      const { userId, accountId } = await semear(prisma, 3, 7);
      await prisma.creditCard.create({
        data: { name: 'Vazio', limitAmount: 100, closingDay: 1, dueDay: 2, userId }
      });
      await prisma.transaction.create({
        data: { amount: 0.1, date: new Date(2026, 2, 5), description: 'a', type: 'EXPENSE', accountId, creditCardId: (await prisma.creditCard.findFirst({ orderBy: { id: 'asc' } })).id }
      });
      await prisma.transaction.create({
        data: { amount: 0.2, date: new Date(2026, 2, 6), description: 'b', type: 'EXPENSE', accountId, creditCardId: (await prisma.creditCard.findFirst({ orderBy: { id: 'asc' } })).id }
      });
      const servico = new CreditCardService();
      const esperado = await getCardsByUserLegado(cliente, userId);
      const obtido = await servico.getCardsByUser(userId, cliente);
      compararAproximado(esperado, obtido, 1e-9);
    }
  },
  {
    nome: 'getCardsByUser: usuario sem cartoes',
    executar: async ({ prisma, cliente }: ContextoDb) => {
      await limparTudo(prisma);
      const usuario = await criarUsuario(prisma);
      const servico = new CreditCardService();
      compararAproximado(
        await getCardsByUserLegado(cliente, usuario.id),
        await servico.getCardsByUser(usuario.id, cliente),
        1e-9
      );
    }
  },
  {
    nome: 'getCardsByUser: soma inteira no primeiro cartao e fracionaria no seguinte',
    executar: async ({ prisma, cliente }: ContextoDb) => {
      await limparTudo(prisma);
      const usuario = await criarUsuario(prisma);
      const conta = await criarConta(prisma, usuario.id);
      const ids: number[] = [];
      for (const nome of ['Inteiro', 'Fracionario']) {
        const cartao = await prisma.creditCard.create({
          data: { name: nome, limitAmount: 1000, closingDay: 1, dueDay: 2, userId: usuario.id }
        });
        ids.push(cartao.id);
      }
      await prisma.transaction.create({
        data: { amount: 100, date: new Date(2026, 2, 5), description: 'a', type: 'EXPENSE', accountId: conta.id, creditCardId: ids[0] }
      });
      await prisma.transaction.create({
        data: { amount: 50.5, date: new Date(2026, 2, 6), description: 'b', type: 'EXPENSE', accountId: conta.id, creditCardId: ids[1] }
      });
      const servico = new CreditCardService();
      compararAproximado(
        await getCardsByUserLegado(cliente, usuario.id),
        await servico.getCardsByUser(usuario.id, cliente),
        1e-9
      );
    }
  }
];

export const disponivel = () => aceitaClienteInjetado(db => new CreditCardService().getCardsByUser(-1, db));
