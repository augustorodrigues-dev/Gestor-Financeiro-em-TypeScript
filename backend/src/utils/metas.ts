export interface MetaBase {
  targetAmount: unknown;
  currentAmount: unknown;
}

export type MetaComProgresso<T extends MetaBase> = Omit<T, 'targetAmount' | 'currentAmount'> & {
  targetAmount: number;
  currentAmount: number;
  progressPercentage: number;
  isCompleted: boolean;
};

export function calcularProgressoMetas<T extends MetaBase>(goals: T[]): MetaComProgresso<T>[] {
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
    } as MetaComProgresso<T>;
  });
}
