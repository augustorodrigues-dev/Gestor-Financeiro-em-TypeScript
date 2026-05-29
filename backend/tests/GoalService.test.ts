import { GoalService } from '../src/services/GoalService';
import { prisma } from '../src/prisma';

jest.mock('../src/prisma', () => ({
  prisma: {
    goal: {
      findMany: jest.fn(),
    },
  },
}));

describe('GoalService - Lógica de Negócio (Testes Unitários)', () => {
  let goalService: GoalService;

  beforeEach(() => {
    goalService = new GoalService();
    jest.clearAllMocks();
  });

  it('Deve calcular corretamente a porcentagem de progresso e o status isCompleted', async () => {
    const mockGoals = [
      {
        id: 1,
        name: 'Viagem',
        targetAmount: 10000.00,
        currentAmount: 5000.00,
        deadline: new Date('2026-12-31'),
        userId: 1
      }
    ];
    (prisma.goal.findMany as jest.Mock).mockResolvedValue(mockGoals);

    const result = await goalService.getGoalsByUser(1);

    expect(result).toHaveLength(1);
    expect(result[0].progressPercentage).toBe(50.00); // 5000 é 50% de 10000
    expect(result[0].isCompleted).toBe(false);
  });

  it('Deve marcar a meta como isCompleted = true quando o currentAmount atingir o targetAmount', async () => {
    const mockGoals = [{
      id: 2,
      name: 'Reserva de Emergência',
      targetAmount: 20000.00,
      currentAmount: 20000.00,
      deadline: new Date('2026-12-31'),
      userId: 1
    }];
    (prisma.goal.findMany as jest.Mock).mockResolvedValue(mockGoals);

    const result = await goalService.getGoalsByUser(1);

    expect(result[0].progressPercentage).toBe(100.00);
    expect(result[0].isCompleted).toBe(true); // O sistema deve reconhecer o sucesso
  });
});