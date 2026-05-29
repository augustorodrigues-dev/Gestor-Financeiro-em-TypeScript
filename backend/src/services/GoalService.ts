import { prisma } from '../prisma';

interface CreateGoalDTO {
  name: string;
  targetAmount: number;
  deadline: Date;
}

interface UpdateGoalDTO {
  name?: string;
  targetAmount?: number;
  currentAmount?: number;
  deadline?: Date;
}

export class GoalService {
  async createGoal(userId: number, data: CreateGoalDTO) {
    const goal = await prisma.goal.create({
      data: {
        name: data.name,
        targetAmount: data.targetAmount,
        deadline: new Date(data.deadline),
        userId: userId,
      },
    });
    return goal;
  }

  async getGoalsByUser(userId: number) {
    const goals = await prisma.goal.findMany({
      where: { userId },
      orderBy: { deadline: 'asc' },
    });

    return goals.map(goal => {
      const target = Number(goal.targetAmount);
      const current = Number(goal.currentAmount);
      const progressPercentage = target > 0 ? (current / target) * 100 : 0;

      return {
        ...goal,
        targetAmount: target,
        currentAmount: current,
        progressPercentage: parseFloat(progressPercentage.toFixed(2)),
        isCompleted: current >= target
      };
    });
  }

  async updateGoal(goalId: number, userId: number, data: UpdateGoalDTO) {
    // Garante que a meta pertence ao usuário antes de atualizar
    const existingGoal = await prisma.goal.findFirst({
      where: { id: goalId, userId },
    });

    if (!existingGoal) {
      throw new Error('Meta não encontrada ou não pertence ao usuário.');
    }

    const updatedGoal = await prisma.goal.update({
      where: { id: goalId },
      data: {
        name: data.name,
        targetAmount: data.targetAmount,
        currentAmount: data.currentAmount,
        deadline: data.deadline ? new Date(data.deadline) : undefined,
      },
    });

    return updatedGoal;
  }

  async deleteGoal(goalId: number, userId: number) {
    const existingGoal = await prisma.goal.findFirst({
      where: { id: goalId, userId },
    });

    if (!existingGoal) {
      throw new Error('Meta não encontrada ou não pertence ao usuário.');
    }

    await prisma.goal.delete({
      where: { id: goalId },
    });

    return { message: 'Meta financeira cancelada com sucesso.' };
  }
}