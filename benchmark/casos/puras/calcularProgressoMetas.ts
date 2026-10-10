import { calcularProgressoMetas } from '../../../backend/src/utils/metas';
import type { CasoPuro } from '../../lib/tipos';

const progressoMetasLegado = (goals: any[]) =>
  goals.map(goal => {
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

function gerar(n: number) {
  return Array.from({ length: n }, (_, i) => ({
    id: i + 1,
    name: `Meta ${i + 1}`,
    targetAmount: i % 10 === 0 ? '0' : `${1000 + i}.50`,
    currentAmount: `${(i * 7) % 5000}.25`,
    deadline: new Date(2027, i % 12, 1 + (i % 28)),
    userId: 1
  }));
}

export const casos: CasoPuro[] = [
  {
    funcao: 'calcularProgressoMetas',
    cenario: 'unico',
    instanciar: n => {
      const metas = gerar(n);
      return {
        antes: () => progressoMetasLegado(metas),
        depois: () => calcularProgressoMetas(metas)
      };
    }
  }
];
