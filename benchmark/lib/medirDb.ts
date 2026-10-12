import { coletarLixo, mediana } from './medir';
import type { Sonda } from './sonda';

const TEMPO_ALVO_MS = 600;
const LIMITE_LENTO_MS = 5000;
const MIN_AMOSTRAS = 3;
const MAX_AMOSTRAS = 15;

export interface MedicaoDb {
  msTotal: number;
  msConsulta: number;
  msPos: number;
  linhas: number;
  picoHeapMb: number;
  resultado: unknown;
}

async function umaExecucao(sonda: Sonda, fn: () => Promise<unknown>): Promise<MedicaoDb> {
  coletarLixo();
  const base = process.memoryUsage().heapUsed;
  sonda.reiniciar();

  const inicio = process.hrtime.bigint();
  let resultado: unknown;
  try {
    resultado = await fn();
  } catch (erro) {
    resultado = { erro: erro instanceof Error ? erro.message : String(erro) };
  }
  const bruto = Number(process.hrtime.bigint() - inicio) / 1e6;

  const leitura = sonda.ler();
  const pico = Math.max(leitura.picoHeap, process.memoryUsage().heapUsed);
  const msTotal = bruto - leitura.msSobrecarga;

  return {
    msTotal,
    msConsulta: leitura.msConsulta,
    msPos: Math.max(0, msTotal - leitura.msConsulta),
    linhas: leitura.linhas,
    picoHeapMb: Math.max(0, pico - base) / 1048576,
    resultado,
  };
}

export async function medirDb(sonda: Sonda, fn: () => Promise<unknown>): Promise<MedicaoDb> {
  const primeira = await umaExecucao(sonda, fn);
  if (primeira.msTotal > LIMITE_LENTO_MS) {
    return primeira;
  }

  const amostras: MedicaoDb[] = [];
  let acumulado = 0;
  while (amostras.length < MAX_AMOSTRAS && (amostras.length < MIN_AMOSTRAS || acumulado < TEMPO_ALVO_MS)) {
    const amostra = await umaExecucao(sonda, fn);
    amostras.push(amostra);
    acumulado += amostra.msTotal;
  }

  const campo = (seletor: (m: MedicaoDb) => number) => mediana(amostras.map(seletor));

  return {
    msTotal: campo(m => m.msTotal),
    msConsulta: campo(m => m.msConsulta),
    msPos: campo(m => m.msPos),
    linhas: amostras[amostras.length - 1].linhas,
    picoHeapMb: campo(m => m.picoHeapMb),
    resultado: amostras[amostras.length - 1].resultado,
  };
}
