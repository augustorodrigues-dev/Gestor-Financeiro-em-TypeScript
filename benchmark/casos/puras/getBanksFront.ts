import { filtrarBancosPermitidos } from '../../../frontend/src/utils/bancosPermitidos';
import type { CasoPuro } from '../../lib/tipos';

const filtrarBancosLegado = (data: any, bancosPermitidos: { code: number }[]) => {
  const codigosPermitidos = bancosPermitidos.map(banco => banco.code);

  if (Array.isArray(data)) {
    return data.filter((bank: any) => codigosPermitidos.includes(bank.code));
  }

  return [];
};

function mulberry32(semente: number): () => number {
  let estado = semente >>> 0;
  return () => {
    estado = (estado + 0x6d2b79f5) >>> 0;
    let t = estado;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function embaralhar<T>(lista: T[], semente: number): T[] {
  const aleatorio = mulberry32(semente);
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(aleatorio() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

function gerar(n: number, cenario: 'realista' | 'pior') {
  const tamanhoPermitidos = Math.ceil(n / 2);
  const permitidos = Array.from({ length: tamanhoPermitidos }, (_, i) => ({
    code: i + 1,
    name: `Permitido ${i + 1}`
  }));

  const codigos =
    cenario === 'pior'
      ? Array.from({ length: n }, (_, i) => n + tamanhoPermitidos + i + 1)
      : embaralhar(Array.from({ length: n }, (_, i) => i + 1), 20260901);

  const data = codigos.map(code => ({
    ispb: String(code).padStart(8, '0'),
    code,
    name: `Banco ${code}`,
    fullName: `Banco Completo ${code}`
  }));

  return { data, permitidos };
}

export const casos: CasoPuro[] = (['realista', 'pior'] as const).map(cenario => ({
  funcao: 'getBanksFront',
  cenario,
  instanciar: n => {
    const { data, permitidos } = gerar(n, cenario);
    return {
      antes: () => filtrarBancosLegado(data, permitidos),
      depois: () => filtrarBancosPermitidos(data, permitidos)
    };
  }
}));
