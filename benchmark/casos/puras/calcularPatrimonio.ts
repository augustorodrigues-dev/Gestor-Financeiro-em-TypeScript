import { calcularPatrimonio } from '../../../frontend/src/utils/patrimonio';
import type { CasoPuro } from '../../lib/tipos';

const patrimonioLegado = (contas: any[]) =>
  contas.reduce((acc, conta) => acc + Number(conta.balance), 0);

function gerar(n: number) {
  return Array.from({ length: n }, (_, i) => ({
    id: i + 1,
    name: `Conta ${i + 1}`,
    balance: `${(i % 1000) + 0.35}`
  }));
}

export const casos: CasoPuro[] = [
  {
    funcao: 'calcularPatrimonio',
    cenario: 'unico',
    instanciar: n => {
      const contas = gerar(n);
      return {
        antes: () => patrimonioLegado(contas),
        depois: () => calcularPatrimonio(contas)
      };
    }
  }
];
