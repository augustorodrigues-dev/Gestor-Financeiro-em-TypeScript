const TEMPO_ALVO_MS = 200;
const LIMITE_LENTO_MS = 2000;
const MIN_AMOSTRAS = 3;
const MAX_AMOSTRAS = 51;
const MAX_ITERACOES_POR_AMOSTRA = 100000;

export interface Medicao<R> {
  ms: number;
  resultado: R;
}

export function coletarLixo(): void {
  const gc = (globalThis as { gc?: () => void }).gc;
  if (gc) {
    gc();
  }
}

export function mediana(valores: number[]): number {
  const ordenados = [...valores].sort((a, b) => a - b);
  const meio = Math.floor(ordenados.length / 2);
  return ordenados.length % 2 === 1
    ? ordenados[meio]
    : (ordenados[meio - 1] + ordenados[meio]) / 2;
}

function cronometrar<R>(fn: () => R, iteracoes: number): { ms: number; total: number; resultado: R } {
  const inicio = process.hrtime.bigint();
  let resultado = fn();
  for (let i = 1; i < iteracoes; i++) {
    resultado = fn();
  }
  const total = Number(process.hrtime.bigint() - inicio) / 1e6;
  return { ms: total / iteracoes, total, resultado };
}

export function medir<R>(fn: () => R): Medicao<R> {
  coletarLixo();
  const primeira = cronometrar(fn, 1);
  if (primeira.ms > LIMITE_LENTO_MS) {
    return { ms: primeira.ms, resultado: primeira.resultado };
  }

  const iteracoes = Math.max(
    1,
    Math.min(MAX_ITERACOES_POR_AMOSTRA, Math.ceil(1 / Math.max(primeira.ms, 0.0005)))
  );

  const tempos: number[] = [];
  let acumulado = 0;
  let ultimo = primeira.resultado;

  while (tempos.length < MAX_AMOSTRAS && (tempos.length < MIN_AMOSTRAS || acumulado < TEMPO_ALVO_MS)) {
    coletarLixo();
    const amostra = cronometrar(fn, iteracoes);
    tempos.push(amostra.ms);
    acumulado += amostra.total;
    ultimo = amostra.resultado;
  }

  return { ms: mediana(tempos), resultado: ultimo };
}
