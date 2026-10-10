import { readdirSync } from 'node:fs';
import { join } from 'node:path';

export interface ModulosDescobertos<T> {
  carregados: { arquivo: string; modulo: T }[];
  ignorados: string[];
}

export function dependenciaDoProjetoAusente(erro: unknown): boolean {
  const { code, message } = erro as { code?: string; message?: string };
  if (code !== 'MODULE_NOT_FOUND' && code !== 'ERR_MODULE_NOT_FOUND') {
    return false;
  }

  const especificador = /Cannot find (?:module|package) '([^']+)'/.exec(message ?? '')?.[1];
  if (!especificador) {
    return false;
  }

  return especificador.startsWith('.') || /[\\/](frontend|backend)[\\/]src[\\/]/.test(especificador);
}

export async function carregarModulos<T>(pasta: string): Promise<ModulosDescobertos<T>> {
  const arquivos = readdirSync(pasta).filter(arquivo => arquivo.endsWith('.ts')).sort();
  const carregados: { arquivo: string; modulo: T }[] = [];
  const ignorados: string[] = [];

  for (const arquivo of arquivos) {
    try {
      const modulo = (await import(join(pasta, arquivo))) as T;
      carregados.push({ arquivo, modulo });
    } catch (erro) {
      if (dependenciaDoProjetoAusente(erro)) {
        ignorados.push(arquivo.replace(/\.ts$/, ''));
        continue;
      }
      throw erro;
    }
  }

  return { carregados, ignorados };
}

export async function aceitaClienteInjetado(executar: (db: any) => Promise<unknown>): Promise<boolean> {
  let utilizado = false;

  const clienteSentinela = new Proxy(
    {},
    {
      get() {
        utilizado = true;
        throw new Error('cliente injetado utilizado');
      },
    }
  );

  try {
    await executar(clienteSentinela);
  } catch {
    return utilizado;
  }

  return utilizado;
}
