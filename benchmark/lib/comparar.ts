export function compararAproximado(
  esperado: unknown,
  obtido: unknown,
  tolerancia = 1e-6,
  caminho = 'raiz'
): number {
  if (typeof esperado === 'number' && typeof obtido === 'number') {
    const diferenca = Math.abs(esperado - obtido);
    if (diferenca > tolerancia * Math.max(1, Math.abs(esperado))) {
      throw new Error(`${caminho}: ${esperado} != ${obtido}`);
    }
    return diferenca;
  }

  if (Array.isArray(esperado) && Array.isArray(obtido)) {
    if (esperado.length !== obtido.length) {
      throw new Error(`${caminho}: tamanhos diferentes (${esperado.length} != ${obtido.length})`);
    }
    let maior = 0;
    esperado.forEach((valor, i) => {
      maior = Math.max(maior, compararAproximado(valor, obtido[i], tolerancia, `${caminho}[${i}]`));
    });
    return maior;
  }

  if (esperado && obtido && typeof esperado === 'object' && typeof obtido === 'object') {
    const chavesEsperadas = Object.keys(esperado);
    const chavesObtidas = Object.keys(obtido);
    if (chavesEsperadas.join('|') !== chavesObtidas.join('|')) {
      throw new Error(`${caminho}: chaves diferentes (${chavesEsperadas} != ${chavesObtidas})`);
    }
    let maior = 0;
    for (const chave of chavesEsperadas) {
      maior = Math.max(
        maior,
        compararAproximado(
          (esperado as Record<string, unknown>)[chave],
          (obtido as Record<string, unknown>)[chave],
          tolerancia,
          `${caminho}.${chave}`
        )
      );
    }
    return maior;
  }

  if (!Object.is(esperado, obtido)) {
    throw new Error(`${caminho}: ${String(esperado)} != ${String(obtido)}`);
  }
  return 0;
}
