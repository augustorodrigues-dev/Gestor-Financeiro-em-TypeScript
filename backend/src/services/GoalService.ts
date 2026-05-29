import { prisma } from '../prisma';

export class GoalService {
  // CREATE — UC09
  async createGoal(userId: number, data: { name: string; targetAmount: number; currentAmount?: number; deadline: string | Date }) {
    return await prisma.goal.create({
      data: {
        name: data.name,
        targetAmount: data.targetAmount,
        currentAmount: data.currentAmount || 0,
        deadline: new Date(data.deadline),
        userId,
      },
    });
  }

  // READ — metas + progresso calculado
  async getGoalsByUser(userId: number) {
    const goals = await prisma.goal.findMany({
      where: { userId },
      orderBy: { deadline: 'asc' },
    });

    return goals.map((goal) => {
      const target = Number(goal.targetAmount);
      const current = Number(goal.currentAmount);
      const progress = target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0;
      return { ...goal, progress, completed: progress >= 100 };
    });
  }

  // UPDATE — registra aportes / edita a meta (UC09)
  async updateGoal(goalId: number, userId: number, data: { name?: string; targetAmount?: number; currentAmount?: number; deadline?: string | Date }) {
    const goal = await prisma.goal.findFirst({ where: { id: goalId, userId } });
    if (!goal) throw new Error('Meta não encontrada ou acesso negado.');

    return await prisma.goal.update({
      where: { id: goalId },
      data: {
        name: data.name,
        targetAmount: data.targetAmount,
        currentAmount: data.currentAmount,
        deadline: data.deadline ? new Date(data.deadline) : undefined,
      },
    });
  }

  // DELETE
  async deleteGoal(goalId: number, userId: number) {
    const goal = await prisma.goal.findFirst({ where: { id: goalId, userId } });
    if (!goal) throw new Error('Meta não encontrada.');
    return await prisma.goal.delete({ where: { id: goalId } });
  }
}
