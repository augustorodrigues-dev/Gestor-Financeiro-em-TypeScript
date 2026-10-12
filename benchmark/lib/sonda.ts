export interface LeituraSonda {
  msConsulta: number;
  msSobrecarga: number;
  linhas: number;
  picoHeap: number;
}

export interface Sonda {
  cliente: any;
  reiniciar: () => void;
  ler: () => LeituraSonda;
}

function ehObjetoSimples(valor: unknown): valor is Record<string, unknown> {
  return (
    typeof valor === 'object' &&
    valor !== null &&
    Object.getPrototypeOf(valor) === Object.prototype
  );
}

export function contarLinhas(resultado: unknown): number {
  const vistos = new Set<string>();

  const contarObjeto = (objeto: Record<string, unknown>): number => {
    let total = 1;
    for (const [campo, valor] of Object.entries(objeto)) {
      if (campo.startsWith('_')) {
        continue;
      }
      if (Array.isArray(valor)) {
        for (const item of valor) {
          if (ehObjetoSimples(item)) {
            total += contarObjeto(item);
          }
        }
      } else if (ehObjetoSimples(valor) && 'id' in valor) {
        const chave = `${campo}:${String(valor.id)}`;
        if (!vistos.has(chave)) {
          vistos.add(chave);
          total += contarObjeto(valor);
        }
      }
    }
    return total;
  };

  if (Array.isArray(resultado)) {
    let total = 0;
    for (const item of resultado) {
      if (ehObjetoSimples(item)) {
        total += contarObjeto(item);
      }
    }
    return total;
  }

  return ehObjetoSimples(resultado) ? contarObjeto(resultado) : 0;
}

export function criarSonda(prisma: any): Sonda {
  const estado: LeituraSonda = { msConsulta: 0, msSobrecarga: 0, linhas: 0, picoHeap: 0 };

  const cliente = prisma.$extends({
    query: {
      async $allOperations({ args, query }: { args: unknown; query: (args: unknown) => Promise<unknown> }) {
        const inicio = process.hrtime.bigint();
        const resultado = await query(args);
        const fim = process.hrtime.bigint();
        estado.msConsulta += Number(fim - inicio) / 1e6;

        estado.linhas += contarLinhas(resultado);
        estado.picoHeap = Math.max(estado.picoHeap, process.memoryUsage().heapUsed);
        estado.msSobrecarga += Number(process.hrtime.bigint() - fim) / 1e6;

        return resultado;
      },
    },
  });

  return {
    cliente,
    reiniciar: () => {
      estado.msConsulta = 0;
      estado.msSobrecarga = 0;
      estado.linhas = 0;
      estado.picoHeap = 0;
    },
    ler: () => ({ ...estado }),
  };
}
