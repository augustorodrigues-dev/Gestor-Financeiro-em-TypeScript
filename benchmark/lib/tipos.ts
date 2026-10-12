export type Cenario = 'melhor' | 'pior' | 'realista';

export interface Instancia {
  antes: () => unknown;
  depois: () => unknown;
}

export interface CasoPuro {
  funcao: string;
  cenario: string;
  instanciar: (n: number) => Instancia;
}
