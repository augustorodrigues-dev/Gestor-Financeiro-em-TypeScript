import { CreditCardService } from '../../../backend/src/services/CreditCardService';
import { compararAproximado } from '../../lib/comparar';
import { aceitaClienteInjetado } from '../../lib/descoberta';
import { criarConta, criarUsuario, inserirEmLotes, limparTudo, valorEmCentavos } from '../../lib/seed';
import type { CasoDb, ContextoDb, Verificacao } from '../../lib/tiposDb';

const deleteCardLegado = async (db: any, id: number) => {
  const card = await db.creditCard.findUnique({
    where: { id },
    include: { transactions: true }
  });

  if (!card) throw new Error("Cartão não encontrado.");

  if (card.transactions.length > 0) {
    throw new Error("Não é possível excluir um cartão com faturas pendentes ou histórico ativo.");
  }

  return await db.creditCard.delete({
    where: { id }
  });
};

export const casos: CasoDb[] = [
  {
    funcao: 'deleteCard',
    cenario: 'bloqueado_com_t_transacoes',
    preparar: async (n, { prisma, cliente }) => {
      await limparTudo(prisma);
      const usuario = await criarUsuario(prisma);
      const conta = await criarConta(prisma, usuario.id);
      const cartao = await prisma.creditCard.create({
        data: { name: 'Cartao', limitAmount: 5000, closingDay: 25, dueDay: 5, userId: usuario.id }
      });

      const transacoes = Array.from({ length: n }, (_, i) => ({
        amount: valorEmCentavos(i),
        date: new Date(2026, 2, 1 + (i % 28)),
        description: `Compra ${i + 1}`,
        type: 'EXPENSE',
        accountId: conta.id,
        creditCardId: cartao.id
      }));
      await inserirEmLotes(transacoes, lote => prisma.transaction.createMany({ data: lote }));

      const servico = new CreditCardService();
      return {
        antes: () => deleteCardLegado(cliente, cartao.id),
        depois: () => servico.deleteCard(cartao.id, cliente)
      };
    }
  }
];

async function criarCartaoVazio(prisma: any, userId: number) {
  return prisma.creditCard.create({
    data: { name: 'Descartavel', limitAmount: 100, closingDay: 3, dueDay: 4, userId }
  });
}

export const verificacoes: Verificacao[] = [
  {
    nome: 'deleteCard: exclusao bem-sucedida devolve o mesmo cartao',
    executar: async ({ prisma, cliente }: ContextoDb) => {
      await limparTudo(prisma);
      const usuario = await criarUsuario(prisma);
      const servico = new CreditCardService();

      const primeiro = await criarCartaoVazio(prisma, usuario.id);
      const segundo = await criarCartaoVazio(prisma, usuario.id);

      const esperado = await deleteCardLegado(cliente, primeiro.id);
      const obtido = await servico.deleteCard(segundo.id, cliente);

      compararAproximado({ ...esperado, id: 0 }, { ...obtido, id: 0 }, 1e-9);

      if ((await prisma.creditCard.count()) !== 0) {
        throw new Error('Os cartoes deveriam ter sido excluidos');
      }
    }
  },
  {
    nome: 'deleteCard: cartao inexistente e cartao com historico',
    executar: async ({ prisma, cliente }: ContextoDb) => {
      await limparTudo(prisma);
      const usuario = await criarUsuario(prisma);
      const conta = await criarConta(prisma, usuario.id);
      const cartao = await criarCartaoVazio(prisma, usuario.id);
      await prisma.transaction.create({
        data: { amount: 1, date: new Date(2026, 2, 1), description: 'x', type: 'EXPENSE', accountId: conta.id, creditCardId: cartao.id }
      });
      const servico = new CreditCardService();

      for (const id of [cartao.id, cartao.id + 999]) {
        const mensagens: string[] = [];
        for (const executar of [() => deleteCardLegado(cliente, id), () => servico.deleteCard(id, cliente)]) {
          try {
            await executar();
            mensagens.push('sem erro');
          } catch (erro) {
            mensagens.push(erro instanceof Error ? erro.message : String(erro));
          }
        }
        if (mensagens[0] !== mensagens[1]) {
          throw new Error(`Mensagens divergentes: "${mensagens[0]}" != "${mensagens[1]}"`);
        }
      }
    }
  }
];

export const disponivel = () => aceitaClienteInjetado(db => new CreditCardService().deleteCard(-1, db));
