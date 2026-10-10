import { execSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { compararAproximado } from './lib/comparar';
import { carregarModulos } from './lib/descoberta';
import { medirDb } from './lib/medirDb';
import { contarRegistros, limparTudo } from './lib/seed';
import { criarSonda } from './lib/sonda';
import type { CasoDb, ContextoDb, Verificacao } from './lib/tiposDb';

const TAMANHOS = [10, 100, 1000, 10000, 100000];
const N_MAX = Number(process.env.N_MAX ?? 100000);
const FILTRO = process.env.FILTRO ?? '';
const BACKEND = resolve(process.env.BACKEND_DIR ?? join(__dirname, '..', 'backend'));
const ARQUIVO_BANCO = join(__dirname, '.tmp', 'bench.db');
const PASTA_CASOS = join(__dirname, 'casos', 'db');
const PASTA_RESULTADOS = join(__dirname, 'resultados');

const CABECALHO = [
  'n',
  'antes_ms_total',
  'depois_ms_total',
  'antes_ms_consulta',
  'depois_ms_consulta',
  'antes_ms_pos',
  'depois_ms_pos',
  'antes_linhas',
  'depois_linhas',
  'antes_heap_mb',
  'depois_heap_mb',
  'max_diferenca'
].join(',');

function prepararBanco(): void {
  mkdirSync(dirname(ARQUIVO_BANCO), { recursive: true });
  process.env.DATABASE_URL = `file:${ARQUIVO_BANCO.replace(/\\/g, '/')}`;

  if (process.env.PULAR_DB_PUSH === '1') {
    return;
  }

  rmSync(ARQUIVO_BANCO, { force: true });
  execSync('npx prisma db push', { cwd: BACKEND, stdio: 'inherit', env: process.env });
}

interface ModuloDb {
  casos: CasoDb[];
  verificacoes?: Verificacao[];
  disponivel?: () => Promise<boolean>;
}

async function carregarCasos(): Promise<{ casos: CasoDb[]; verificacoes: Verificacao[] }> {
  const { carregados, ignorados } = await carregarModulos<ModuloDb>(PASTA_CASOS);
  const casos: CasoDb[] = [];
  const verificacoes: Verificacao[] = [];

  for (const { arquivo, modulo } of carregados) {
    if (modulo.disponivel && !(await modulo.disponivel())) {
      ignorados.push(arquivo.replace(/\.ts$/, ''));
      continue;
    }
    casos.push(...modulo.casos);
    verificacoes.push(...(modulo.verificacoes ?? []));
  }

  if (ignorados.length > 0) {
    console.log(`Casos ignorados (codigo ainda ausente ou nao refatorado): ${ignorados.sort().join(', ')}`);
  }

  return { casos, verificacoes };
}

function f(valor: number, casas = 3): string {
  return valor.toFixed(casas);
}

async function principal(): Promise<void> {
  prepararBanco();

  const { prisma } = await import(join(BACKEND, 'src', 'prisma'));

  const existentes = await contarRegistros(prisma);
  if (existentes > 0) {
    throw new Error(
      `O banco usado por backend/src/prisma contem ${existentes} registros. Abortando para nao apagar dados. Aponte o cliente para ${process.env.DATABASE_URL} (variavel DATABASE_URL).`
    );
  }

  const sonda = criarSonda(prisma);
  const contexto: ContextoDb = { prisma, cliente: sonda.cliente, sonda };
  const { casos, verificacoes } = await carregarCasos();

  if (casos.length === 0) {
    console.log('Nenhum caso disponivel para executar.');
    await limparTudo(prisma);
    await prisma.$disconnect();
    return;
  }

  console.log('Verificacoes de equivalencia');
  for (const verificacao of verificacoes) {
    await verificacao.executar(contexto);
    console.log(`  ok  ${verificacao.nome}`);
  }

  mkdirSync(PASTA_RESULTADOS, { recursive: true });

  for (const caso of casos.filter(item => `${item.funcao}__${item.cenario}`.includes(FILTRO))) {
    const linhas: string[] = [CABECALHO];
    console.log(`\n${caso.funcao} [${caso.cenario}]`);

    for (const n of TAMANHOS.filter(tamanho => tamanho <= N_MAX)) {
      const instancia = await caso.preparar(n, contexto);
      const antes = await medirDb(sonda, instancia.antes);
      const depois = await medirDb(sonda, instancia.depois);

      let diferenca: number;
      try {
        diferenca = compararAproximado(antes.resultado, depois.resultado, 1e-9);
      } catch (erro) {
        throw new Error(`Saida divergente em ${caso.funcao} [${caso.cenario}] com n=${n}: ${(erro as Error).message}`);
      }

      linhas.push(
        [
          n,
          f(antes.msTotal, 4), f(depois.msTotal, 4),
          f(antes.msConsulta, 4), f(depois.msConsulta, 4),
          f(antes.msPos, 4), f(depois.msPos, 4),
          antes.linhas, depois.linhas,
          f(antes.picoHeapMb), f(depois.picoHeapMb),
          diferenca.toExponential(2)
        ].join(',')
      );

      console.log(
        `  n=${String(n).padStart(6)}  total ${f(antes.msTotal, 2).padStart(10)} -> ${f(depois.msTotal, 2).padStart(10)} ms` +
          `  pos ${f(antes.msPos, 2).padStart(9)} -> ${f(depois.msPos, 2).padStart(8)} ms` +
          `  linhas ${String(antes.linhas).padStart(7)} -> ${String(depois.linhas).padStart(7)}` +
          `  heap ${f(antes.picoHeapMb, 1).padStart(7)} -> ${f(depois.picoHeapMb, 1).padStart(6)} MB` +
          `  dif ${diferenca.toExponential(1)}`
      );
    }

    writeFileSync(join(PASTA_RESULTADOS, `${caso.funcao}__${caso.cenario}.csv`), linhas.join('\n') + '\n');
  }

  await limparTudo(prisma);
  await prisma.$disconnect();
}

principal().catch(erro => {
  console.error(erro);
  process.exit(1);
});
