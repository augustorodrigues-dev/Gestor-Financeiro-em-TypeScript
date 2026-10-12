import { selecionarBancosValidos } from '../../../backend/src/utils/bancosValidos';
import type { CasoPuro } from '../../lib/tipos';

const selecionarBancosLegado = (data: any[]) => {
  const validBanks = data.filter((bank: any) => bank.code && bank.name);
  return validBanks.slice(0, 20);
};

function gerar(n: number, cenario: 'melhor' | 'pior') {
  const validos = Math.min(20, n);
  const invalidos = n - validos;

  if (cenario === 'melhor') {
    return Array.from({ length: n }, (_, i) => ({
      ispb: String(i).padStart(8, '0'),
      code: i + 1,
      name: `Banco ${i + 1}`,
      fullName: 'Valido'
    }));
  }

  const lista: { ispb: string; code: number | null; name: string; fullName: string }[] = [];
  for (let i = 0; i < invalidos; i++) {
    lista.push({
      ispb: String(i).padStart(8, '0'),
      code: i % 2 === 0 ? null : i + 1,
      name: i % 2 === 0 ? 'Sem codigo' : '',
      fullName: 'Invalido'
    });
  }
  for (let i = 0; i < validos; i++) {
    lista.push({
      ispb: String(invalidos + i).padStart(8, '0'),
      code: invalidos + i + 1,
      name: `Banco ${invalidos + i + 1}`,
      fullName: 'Valido'
    });
  }
  return lista;
}

export const casos: CasoPuro[] = (['melhor', 'pior'] as const).map(cenario => ({
  funcao: 'getBanksBack',
  cenario,
  instanciar: n => {
    const bancos = gerar(n, cenario);
    return {
      antes: () => selecionarBancosLegado(bancos),
      depois: () => selecionarBancosValidos(bancos)
    };
  }
}));
