import { GoalService } from '../../src/services/GoalService';
import { prisma } from '../../src/prisma';

jest.mock('../../src/prisma', () => ({
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

const prismaMock = prisma as unknown as { goal: Record<string, jest.Mock> };

describe('Unitário: GoalService', () => {
  const service = new GoalService();
  beforeEach(() => jest.clearAllMocks());

  it('cria meta com prazo convertido em Date', async () => {
    prismaMock.goal.create.mockResolvedValue({ id: 1 });
    await service.createGoal(7, { name: 'Viagem', targetAmount: 5000, deadline: '2026-12-31' });
    const arg = prismaMock.goal.create.mock.calls[0][0];
    expect(arg.data.deadline).toBeInstanceOf(Date);
    expect(arg.data.userId).toBe(7);
  });

  it('calcula progresso e completed', async () => {
    prismaMock.goal.findMany.mockResolvedValue([
      { id: 1, targetAmount: 1000, currentAmount: 500 },
      { id: 2, targetAmount: 1000, currentAmount: 1000 },
    ]);
    const goals = await service.getGoalsByUser(7);
    expect(goals[0].progress).toBe(50);
    expect(goals[0].completed).toBe(false);
    expect(goals[1].progress).toBe(100);
    expect(goals[1].completed).toBe(true);
  });

  it('limita progresso a 100%', async () => {
    prismaMock.goal.findMany.mockResolvedValue([{ id: 1, targetAmount: 100, currentAmount: 250 }]);
    const goals = await service.getGoalsByUser(7);
    expect(goals[0].progress).toBe(100);
  });

  it('atualiza meta do dono (aporte)', async () => {
    prismaMock.goal.findFirst.mockResolvedValue({ id: 1, userId: 7 });
    prismaMock.goal.update.mockResolvedValue({ id: 1 });
    await service.updateGoal(1, 7, { currentAmount: 999 });
    expect(prismaMock.goal.update).toHaveBeenCalled();
  });

  it('nega update de meta de terceiro', async () => {
    prismaMock.goal.findFirst.mockResolvedValue(null);
    await expect(service.updateGoal(1, 7, {})).rejects.toThrow('acesso negado');
  });

  it('exclui meta existente', async () => {
    prismaMock.goal.findFirst.mockResolvedValue({ id: 1 });
    prismaMock.goal.delete.mockResolvedValue({ id: 1 });
    await service.deleteGoal(1, 7);
    expect(prismaMock.goal.delete).toHaveBeenCalledWith({ where: { id: 1 } });
  });
});
