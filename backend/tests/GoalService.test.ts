import { GoalService } from '../src/services/GoalService';
import { prisma } from '../src/prisma';

jest.mock('../src/prisma', () => ({
  prisma: {
    goal: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('GoalService - Lógica de Negócio (Testes Unitários)', () => {
  let goalService: GoalService;

  beforeEach(() => {
    goalService = new GoalService();
    jest.clearAllMocks();
  });

  it('1. Deve criar uma meta financeira convertendo o prazo para Date', async () => {
    (prisma.goal.create as jest.Mock).mockResolvedValue({ id: 1, name: 'Viagem' });

    await goalService.createGoal(1, { name: 'Viagem', targetAmount: 10000, deadline: new Date('2026-12-31') });

    expect(prisma.goal.create).toHaveBeenCalledTimes(1);
  });

  it('2. Deve calcular corretamente a porcentagem de progresso e o status isCompleted', async () => {
    (prisma.goal.findMany as jest.Mock).mockResolvedValue([
      { id: 1, name: 'Viagem', targetAmount: 10000, currentAmount: 5000, deadline: new Date('2026-12-31'), userId: 1 },
    ]);

    const result = await goalService.getGoalsByUser(1);

    expect(result[0].progressPercentage).toBe(50);
    expect(result[0].isCompleted).toBe(false);
  });

  it('3. Deve marcar a meta como isCompleted quando o valor atual atingir o alvo', async () => {
    (prisma.goal.findMany as jest.Mock).mockResolvedValue([
      { id: 2, name: 'Reserva', targetAmount: 20000, currentAmount: 20000, deadline: new Date('2026-12-31'), userId: 1 },
    ]);

    const result = await goalService.getGoalsByUser(1);

    expect(result[0].progressPercentage).toBe(100);
    expect(result[0].isCompleted).toBe(true);
  });

  it('4. Deve evitar divisão por zero quando o valor alvo for 0', async () => {
    (prisma.goal.findMany as jest.Mock).mockResolvedValue([
      { id: 3, name: 'Zero', targetAmount: 0, currentAmount: 0, deadline: new Date('2026-12-31'), userId: 1 },
    ]);

    const result = await goalService.getGoalsByUser(1);

    expect(result[0].progressPercentage).toBe(0);
  });

  it('5. Deve bloquear a atualização de meta de outro usuário', async () => {
    (prisma.goal.findFirst as jest.Mock).mockResolvedValue(null);

    await expect(goalService.updateGoal(1, 99, { currentAmount: 100 }))
      .rejects.toThrow('Meta não encontrada ou não pertence ao usuário.');
  });

  it('6. Deve registrar um aporte atualizando o valor atual da meta', async () => {
    (prisma.goal.findFirst as jest.Mock).mockResolvedValue({ id: 1, userId: 1 });
    (prisma.goal.update as jest.Mock).mockResolvedValue({ id: 1, currentAmount: 10000 });

    const result = await goalService.updateGoal(1, 1, { currentAmount: 10000 });

    expect(Number(result.currentAmount)).toBe(10000);
  });

  it('7. Deve bloquear a exclusão de meta inexistente', async () => {
    (prisma.goal.findFirst as jest.Mock).mockResolvedValue(null);

    await expect(goalService.deleteGoal(1, 1))
      .rejects.toThrow('Meta não encontrada ou não pertence ao usuário.');
  });

  it('8. Deve cancelar (excluir) uma meta existente retornando mensagem de sucesso', async () => {
    (prisma.goal.findFirst as jest.Mock).mockResolvedValue({ id: 1, userId: 1 });
    (prisma.goal.delete as jest.Mock).mockResolvedValue({ id: 1 });

    const result = await goalService.deleteGoal(1, 1);

    expect(result.message).toMatch(/cancelada com sucesso/i);
    expect(prisma.goal.delete).toHaveBeenCalledWith({ where: { id: 1 } });
  });
});
