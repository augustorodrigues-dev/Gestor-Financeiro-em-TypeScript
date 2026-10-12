import type { Sonda } from './sonda';

export interface ContextoDb {
  prisma: any;
  cliente: any;
  sonda: Sonda;
}

export interface InstanciaDb {
  antes: () => Promise<unknown>;
  depois: () => Promise<unknown>;
}

export interface CasoDb {
  funcao: string;
  cenario: string;
  preparar: (n: number, contexto: ContextoDb) => Promise<InstanciaDb>;
}

export interface Verificacao {
  nome: string;
  executar: (contexto: ContextoDb) => Promise<void>;
}
