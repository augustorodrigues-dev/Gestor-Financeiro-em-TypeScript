import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

type Colunas = Record<string, number[]>;

interface Figura {
  numero: number;
  arquivo: string;
  titulo: string;
}

interface Metrica {
  chave: string;
  titulo: string;
  unidade: string;
  antes: string;
  depois: string;
}

interface OpcoesGrafico {
  x: number;
  y: number;
  largura: number;
  altura: number;
  titulo: string;
  subtitulo: string;
  unidade: string;
  ns: number[];
  antes: number[];
  depois: number[];
}

interface LinhaResumo {
  figura: number;
  caso: string;
  metrica: string;
  nMax: number;
  antes: number;
  depois: number;
  razao: number;
  pAntes: number | null;
  pDepois: number | null;
}

const PASTA_RESULTADOS = process.env.RESULTADOS ?? join(__dirname, 'resultados');
const PASTA_FIGURAS = process.env.FIGURAS ?? join(__dirname, 'figuras');

const COR_ANTES = '#c2410c';
const COR_DEPOIS = '#1d4ed8';
const COR_TEXTO = '#1f2937';
const COR_SECUNDARIA = '#6b7280';
const COR_GRADE = '#d1d5db';
const COR_GRADE_FRACA = '#eef0f3';
const FONTE = 'DejaVu Sans, Segoe UI, Arial, Helvetica, sans-serif';

const FIGURAS_MEMORIA: Figura[] = [
  { numero: 1, arquivo: 'montarExtrato__pior', titulo: 'montarExtrato, pior caso' },
  { numero: 2, arquivo: 'montarExtrato__melhor', titulo: 'montarExtrato, melhor caso' },
  { numero: 3, arquivo: 'getBanksFront__realista', titulo: 'filtrarBancosPermitidos, caso realista (B = N/2)' },
  { numero: 4, arquivo: 'getBanksFront__pior', titulo: 'filtrarBancosPermitidos, pior caso (B = N/2)' },
  { numero: 5, arquivo: 'getBanksBack__melhor', titulo: 'selecionarBancosValidos, melhor caso' },
  { numero: 6, arquivo: 'getBanksBack__pior', titulo: 'selecionarBancosValidos, pior caso' },
  { numero: 7, arquivo: 'calcularProgressoMetas__unico', titulo: 'calcularProgressoMetas' },
  { numero: 8, arquivo: 'calcularPatrimonio__unico', titulo: 'calcularPatrimonio' }
];

const FIGURAS_DB: Figura[] = [
  { numero: 9, arquivo: 'deleteCard__bloqueado_com_t_transacoes', titulo: 'deleteCard, t = n transações vinculadas' },
  { numero: 10, arquivo: 'getCardsByUser__t_grande', titulo: 'getCardsByUser, C = 5 cartões e T = n' },
  { numero: 11, arquivo: 'getCardsByUser__c_proporcional', titulo: 'getCardsByUser, C = n/10 cartões' },
  { numero: 12, arquivo: 'getMonthlyReport__k_fixo', titulo: 'getMonthlyReport, k = 20 categorias' },
  { numero: 13, arquivo: 'getMonthlyReport__k_proporcional', titulo: 'getMonthlyReport, k = n/10 categorias' }
];

const METRICAS_DB: Metrica[] = [
  { chave: 'tempo_total', titulo: 'Tempo total', unidade: 'ms', antes: 'antes_ms_total', depois: 'depois_ms_total' },
  { chave: 'pos_processamento', titulo: 'Pós-processamento na aplicação', unidade: 'ms', antes: 'antes_ms_pos', depois: 'depois_ms_pos' },
  { chave: 'linhas', titulo: 'Linhas materializadas', unidade: 'linhas', antes: 'antes_linhas', depois: 'depois_linhas' },
  { chave: 'heap', titulo: 'Pico de heap', unidade: 'MB', antes: 'antes_heap_mb', depois: 'depois_heap_mb' }
];

let Resvg: any = null;
try {
  Resvg = require('@resvg/resvg-js').Resvg;
} catch {
  Resvg = null;
}

function lerCsv(caminho: string): Colunas | null {
  if (!existsSync(caminho)) {
    return null;
  }
  const linhas = readFileSync(caminho, 'utf8').trim().split(/\r?\n/);
  const cabecalho = linhas[0].split(',');
  const colunas: Colunas = {};
  for (const nome of cabecalho) {
    colunas[nome] = [];
  }
  for (const linha of linhas.slice(1)) {
    const campos = linha.split(',');
    cabecalho.forEach((nome, i) => colunas[nome].push(Number(campos[i])));
  }
  return colunas;
}

function formatar(valor: number, casas: number): string {
  return valor.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });
}

function formatarMarca(expoente: number): string {
  return Math.pow(10, expoente).toLocaleString('pt-BR', { maximumFractionDigits: Math.max(0, -expoente) });
}

function escapar(texto: string): string {
  return texto.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function expoente(ns: number[], valores: number[]): number | null {
  const ultimo = ns.length - 1;
  if (ultimo < 1 || !(valores[ultimo] > 0) || !(valores[ultimo - 1] > 0)) {
    return null;
  }
  return Math.log10(valores[ultimo] / valores[ultimo - 1]) / Math.log10(ns[ultimo] / ns[ultimo - 1]);
}

function razaoEntre(antes: number, depois: number): number {
  return depois > 0 ? antes / depois : Infinity;
}

function textoRazao(razao: number, n: number): string {
  return `n = ${formatar(n, 0)}: razão antes ÷ depois = ${formatar(razao, 2)}`;
}

function rotuloSerie(nome: string, p: number | null): string {
  return p === null ? nome : `${nome} (p = ${formatar(p, 2)})`;
}

function grafico(o: OpcoesGrafico): string {
  const margem = { esquerda: 88, direita: 22, topo: 66, base: 56 };
  const px = o.x + margem.esquerda;
  const py = o.y + margem.topo;
  const pw = o.largura - margem.esquerda - margem.direita;
  const ph = o.altura - margem.topo - margem.base;

  const positivos = [...o.antes, ...o.depois].filter(valor => valor > 0);
  if (positivos.length === 0) {
    return `<text x="${o.x + 10}" y="${o.y + 24}" font-size="14" fill="${COR_TEXTO}">${escapar(o.titulo)}: sem dados</text>`;
  }

  const xMin = Math.log10(Math.min(...o.ns)) - 0.25;
  const xMax = Math.log10(Math.max(...o.ns)) + 0.25;
  const yMin = Math.floor(Math.log10(Math.min(...positivos)) - 0.1);
  const yMax = Math.max(Math.ceil(Math.log10(Math.max(...positivos)) + 0.1), yMin + 1);

  const sx = (n: number) => px + ((Math.log10(n) - xMin) / (xMax - xMin)) * pw;
  const sy = (valor: number) => py + ph - ((Math.log10(valor) - yMin) / (yMax - yMin)) * ph;

  const partes: string[] = [];

  partes.push(`<text x="${o.x + 8}" y="${o.y + 22}" font-size="16" font-weight="bold" fill="${COR_TEXTO}">${escapar(o.titulo)}</text>`);
  partes.push(`<text x="${o.x + 8}" y="${o.y + 42}" font-size="12" fill="${COR_SECUNDARIA}">${escapar(o.subtitulo)}</text>`);

  for (let e = yMin; e < yMax; e++) {
    for (let m = 2; m <= 9; m++) {
      const y = sy(m * Math.pow(10, e));
      partes.push(`<line x1="${px}" y1="${y.toFixed(1)}" x2="${px + pw}" y2="${y.toFixed(1)}" stroke="${COR_GRADE_FRACA}" stroke-width="1"/>`);
    }
  }
  for (let e = yMin; e <= yMax; e++) {
    const y = sy(Math.pow(10, e));
    partes.push(`<line x1="${px}" y1="${y.toFixed(1)}" x2="${px + pw}" y2="${y.toFixed(1)}" stroke="${COR_GRADE}" stroke-width="1"/>`);
    partes.push(`<text x="${px - 8}" y="${(y + 4).toFixed(1)}" font-size="11" text-anchor="end" fill="${COR_SECUNDARIA}">${formatarMarca(e)}</text>`);
  }
  for (let e = Math.ceil(xMin); e <= Math.floor(xMax); e++) {
    const x = sx(Math.pow(10, e));
    partes.push(`<line x1="${x.toFixed(1)}" y1="${py}" x2="${x.toFixed(1)}" y2="${py + ph}" stroke="${COR_GRADE}" stroke-width="1"/>`);
    partes.push(`<text x="${x.toFixed(1)}" y="${py + ph + 18}" font-size="11" text-anchor="middle" fill="${COR_SECUNDARIA}">${formatarMarca(e)}</text>`);
  }

  partes.push(`<rect x="${px}" y="${py}" width="${pw}" height="${ph}" fill="none" stroke="#9ca3af" stroke-width="1"/>`);
  partes.push(`<text x="${px + pw / 2}" y="${py + ph + 42}" font-size="12" text-anchor="middle" fill="${COR_TEXTO}">n (tamanho da entrada, escala logarítmica)</text>`);
  partes.push(`<text transform="translate(${o.x + 18} ${py + ph / 2}) rotate(-90)" font-size="12" text-anchor="middle" fill="${COR_TEXTO}">${escapar(o.unidade)}, escala log.</text>`);

  const trajeto = (valores: number[]) =>
    valores
      .map((valor, i) => (valor > 0 ? `${sx(o.ns[i]).toFixed(1)},${sy(valor).toFixed(1)}` : null))
      .filter((ponto): ponto is string => ponto !== null)
      .join(' ');

  partes.push(`<polyline points="${trajeto(o.antes)}" fill="none" stroke="${COR_ANTES}" stroke-width="2.5" stroke-linejoin="round"/>`);
  partes.push(`<polyline points="${trajeto(o.depois)}" fill="none" stroke="${COR_DEPOIS}" stroke-width="2.5" stroke-linejoin="round"/>`);

  o.antes.forEach((valor, i) => {
    if (valor > 0) {
      partes.push(`<circle cx="${sx(o.ns[i]).toFixed(1)}" cy="${sy(valor).toFixed(1)}" r="4.5" fill="${COR_ANTES}" stroke="#ffffff" stroke-width="1.5"/>`);
    }
  });
  o.depois.forEach((valor, i) => {
    if (valor > 0) {
      partes.push(`<rect x="${(sx(o.ns[i]) - 4.5).toFixed(1)}" y="${(sy(valor) - 4.5).toFixed(1)}" width="9" height="9" fill="${COR_DEPOIS}" stroke="#ffffff" stroke-width="1.5"/>`);
    }
  });

  const rotuloAntes = rotuloSerie('Antes', expoente(o.ns, o.antes));
  const rotuloDepois = rotuloSerie('Depois', expoente(o.ns, o.depois));
  const larguraLegenda = Math.max(rotuloAntes.length, rotuloDepois.length) * 6.6 + 40;
  partes.push(`<rect x="${px + 10}" y="${py + 8}" width="${larguraLegenda.toFixed(0)}" height="48" rx="4" fill="#ffffff" fill-opacity="0.92" stroke="${COR_GRADE}"/>`);
  partes.push(`<circle cx="${px + 25}" cy="${py + 23}" r="4.5" fill="${COR_ANTES}"/>`);
  partes.push(`<text x="${px + 38}" y="${py + 27}" font-size="12" fill="${COR_TEXTO}">${escapar(rotuloAntes)}</text>`);
  partes.push(`<rect x="${px + 20.5}" y="${py + 38.5}" width="9" height="9" fill="${COR_DEPOIS}"/>`);
  partes.push(`<text x="${px + 38}" y="${py + 47}" font-size="12" fill="${COR_TEXTO}">${escapar(rotuloDepois)}</text>`);

  return partes.join('');
}

function documento(largura: number, altura: number, conteudo: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${largura}" height="${altura}" viewBox="0 0 ${largura} ${altura}" font-family="${FONTE}"><rect width="${largura}" height="${altura}" fill="#ffffff"/>${conteudo}</svg>`;
}

function figuraSimples(figura: Figura, colunas: Colunas, resumo: LinhaResumo[]): { svg: string; largura: number; altura: number } {
  const largura = 760;
  const altura = 470;
  const ns = colunas.n;
  const ultimo = ns.length - 1;
  const antes = colunas.antes_ms;
  const depois = colunas.depois_ms;
  const razao = colunas.razao ? colunas.razao[ultimo] : razaoEntre(antes[ultimo], depois[ultimo]);

  resumo.push({
    figura: figura.numero,
    caso: figura.arquivo,
    metrica: 'tempo_ms',
    nMax: ns[ultimo],
    antes: antes[ultimo],
    depois: depois[ultimo],
    razao,
    pAntes: expoente(ns, antes),
    pDepois: expoente(ns, depois)
  });

  const conteudo = grafico({
    x: 0,
    y: 0,
    largura,
    altura,
    titulo: `Figura ${figura.numero}. ${figura.titulo}`,
    subtitulo: textoRazao(razao, ns[ultimo]),
    unidade: 'Tempo (ms)',
    ns,
    antes,
    depois
  });

  return { svg: documento(largura, altura, conteudo), largura, altura };
}

function figuraPainel(figura: Figura, colunas: Colunas, resumo: LinhaResumo[]): { svg: string; largura: number; altura: number } {
  const larguraCelula = 580;
  const alturaCelula = 400;
  const cabecalho = 78;
  const largura = larguraCelula * 2;
  const altura = cabecalho + alturaCelula * 2;
  const ns = colunas.n;
  const ultimo = ns.length - 1;

  const partes: string[] = [];
  partes.push(`<text x="12" y="30" font-size="19" font-weight="bold" fill="${COR_TEXTO}">Figura ${figura.numero}. ${escapar(figura.titulo)}</text>`);
  partes.push(`<text x="12" y="54" font-size="12" fill="${COR_SECUNDARIA}">Antes e depois da refatoração; p é o expoente empírico entre os dois maiores valores de n.</text>`);

  METRICAS_DB.forEach((metrica, i) => {
    const antes = colunas[metrica.antes];
    const depois = colunas[metrica.depois];
    if (!antes || !depois) {
      return;
    }

    resumo.push({
      figura: figura.numero,
      caso: figura.arquivo,
      metrica: metrica.chave,
      nMax: ns[ultimo],
      antes: antes[ultimo],
      depois: depois[ultimo],
      razao: razaoEntre(antes[ultimo], depois[ultimo]),
      pAntes: expoente(ns, antes),
      pDepois: expoente(ns, depois)
    });

    partes.push(
      grafico({
        x: (i % 2) * larguraCelula,
        y: cabecalho + Math.floor(i / 2) * alturaCelula,
        largura: larguraCelula,
        altura: alturaCelula,
        titulo: metrica.titulo,
        subtitulo: textoRazao(razaoEntre(antes[ultimo], depois[ultimo]), ns[ultimo]),
        unidade: metrica.unidade,
        ns,
        antes,
        depois
      })
    );
  });

  return { svg: documento(largura, altura, partes.join('')), largura, altura };
}

function gravarFigura(nome: string, svg: string, largura: number): void {
  writeFileSync(join(PASTA_FIGURAS, `${nome}.svg`), svg);
  if (Resvg) {
    const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: largura * 2 }, font: { loadSystemFonts: true } });
    writeFileSync(join(PASTA_FIGURAS, `${nome}.png`), resvg.render().asPng());
  }
}

function tabelaResumoHtml(resumo: LinhaResumo[]): string {
  const linhas = resumo
    .map(
      linha =>
        `<tr><td>${linha.figura}</td><td>${escapar(linha.caso)}</td><td>${linha.metrica}</td><td>${formatar(linha.nMax, 0)}</td><td>${formatar(linha.antes, 4)}</td><td>${formatar(linha.depois, 4)}</td><td>${formatar(linha.razao, 2)}</td><td>${linha.pAntes === null ? '-' : formatar(linha.pAntes, 2)}</td><td>${linha.pDepois === null ? '-' : formatar(linha.pDepois, 2)}</td></tr>`
    )
    .join('');
  return `<table><thead><tr><th>Figura</th><th>Caso</th><th>Métrica</th><th>n máximo</th><th>Antes</th><th>Depois</th><th>Razão</th><th>p antes</th><th>p depois</th></tr></thead><tbody>${linhas}</tbody></table>`;
}

function paginaHtml(blocos: string[], resumo: LinhaResumo[]): string {
  const estilo =
    `body{font-family:${FONTE};color:${COR_TEXTO};max-width:1200px;margin:24px auto;padding:0 16px}` +
    'figure{margin:0 0 32px 0;border:1px solid #e5e7eb;border-radius:6px;padding:8px}' +
    'svg{max-width:100%;height:auto}' +
    'table{border-collapse:collapse;font-size:13px;width:100%}' +
    'th,td{border:1px solid #e5e7eb;padding:4px 8px;text-align:right}' +
    'th:nth-child(2),td:nth-child(2),th:nth-child(3),td:nth-child(3){text-align:left}';
  const figuras = blocos.map(bloco => `<figure>${bloco}</figure>`).join('');
  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><title>Figuras do benchmark</title><style>${estilo}</style></head><body><h1>Figuras do benchmark</h1>${figuras}<h2>Resumo numérico</h2>${tabelaResumoHtml(resumo)}</body></html>`;
}

function resumoCsv(resumo: LinhaResumo[]): string {
  const linhas = resumo.map(linha =>
    [
      linha.figura,
      linha.caso,
      linha.metrica,
      linha.nMax,
      linha.antes,
      linha.depois,
      linha.razao.toFixed(2),
      linha.pAntes === null ? '' : linha.pAntes.toFixed(2),
      linha.pDepois === null ? '' : linha.pDepois.toFixed(2)
    ].join(',')
  );
  return ['figura,caso,metrica,n_max,antes,depois,razao,p_antes,p_depois', ...linhas].join('\n') + '\n';
}

function executar(): void {
  mkdirSync(PASTA_FIGURAS, { recursive: true });

  const resumo: LinhaResumo[] = [];
  const blocos: string[] = [];
  const ignoradas: string[] = [];
  let geradas = 0;

  const processar = (
    figura: Figura,
    construir: (figura: Figura, colunas: Colunas, resumo: LinhaResumo[]) => { svg: string; largura: number; altura: number }
  ): void => {
    const colunas = lerCsv(join(PASTA_RESULTADOS, `${figura.arquivo}.csv`));
    if (!colunas) {
      ignoradas.push(`Figura ${figura.numero} (${figura.arquivo})`);
      return;
    }
    const { svg, largura } = construir(figura, colunas, resumo);
    const nome = `figura-${String(figura.numero).padStart(2, '0')}-${figura.arquivo}`;
    gravarFigura(nome, svg, largura);
    blocos.push(svg);
    geradas++;
    console.log(`  ok  ${nome}`);
  };

  console.log(`Lendo ${PASTA_RESULTADOS}`);
  FIGURAS_MEMORIA.forEach(figura => processar(figura, figuraSimples));
  FIGURAS_DB.forEach(figura => processar(figura, figuraPainel));

  writeFileSync(join(PASTA_FIGURAS, 'resumo.csv'), resumoCsv(resumo));
  writeFileSync(join(PASTA_FIGURAS, 'index.html'), paginaHtml(blocos, resumo));

  console.log(`\n${geradas} figuras gravadas em ${PASTA_FIGURAS}${Resvg ? ' (SVG e PNG)' : ' (SVG; instale @resvg/resvg-js para gerar PNG)'}`);
  if (ignoradas.length > 0) {
    console.log(`Sem CSV correspondente, ignoradas: ${ignoradas.join(', ')}`);
  }
}

executar();
