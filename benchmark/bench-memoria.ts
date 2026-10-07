import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { deepStrictEqual } from 'node:assert/strict';
import { carregarModulos } from './lib/descoberta';
import { medir } from './lib/medir';
import type { CasoPuro } from './lib/tipos';

const TAMANHOS = [10, 100, 1000, 10000, 100000];
const N_MAX = Number(process.env.N_MAX ?? 100000);
const FILTRO = process.env.FILTRO ?? '';
const PASTA_CASOS = join(__dirname, 'casos', 'puras');
const PASTA_RESULTADOS = join(__dirname, 'resultados');

function formatar(valor: number): string {
  return valor.toFixed(6);
}

async function executar(): Promise<void> {
  const { carregados, ignorados } = await carregarModulos<{ casos: CasoPuro[] }>(PASTA_CASOS);

  const casos = carregados
    .flatMap(({ modulo }) => modulo.casos)
    .filter(caso => `${caso.funcao}__${caso.cenario}`.includes(FILTRO));

  if (ignorados.length > 0) {
    console.log(`Casos ignorados (arquivos do projeto ainda ausentes): ${ignorados.join(', ')}`);
  }

  if (casos.length === 0) {
    console.log('Nenhum caso disponivel para executar.');
    return;
  }

  mkdirSync(PASTA_RESULTADOS, { recursive: true });

  for (const { funcao, cenario, instanciar } of casos) {
    const linhas: string[] = ['n,antes_ms,depois_ms,razao'];
    console.log(`\n${funcao} [${cenario}]`);

    for (const n of TAMANHOS.filter(tamanho => tamanho <= N_MAX)) {
      const instancia = instanciar(n);
      const antes = medir(instancia.antes);
      const depois = medir(instancia.depois);

      try {
        deepStrictEqual(depois.resultado, antes.resultado);
      } catch {
        throw new Error(`Saida divergente em ${funcao} [${cenario}] com n=${n}`);
      }

      const razao = depois.ms > 0 ? antes.ms / depois.ms : Infinity;
      linhas.push(`${n},${formatar(antes.ms)},${formatar(depois.ms)},${razao.toFixed(2)}`);
      console.log(
        `  n=${String(n).padStart(6)}  antes=${formatar(antes.ms).padStart(14)} ms  depois=${formatar(depois.ms).padStart(14)} ms  razao=${razao.toFixed(2)}x  saida identica`
      );
    }

    writeFileSync(join(PASTA_RESULTADOS, `${funcao}__${cenario}.csv`), linhas.join('\n') + '\n');
  }
}

executar().catch(erro => {
  console.error(erro);
  process.exit(1);
});
