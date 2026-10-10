export function selecionarBancosValidos<T extends { code?: unknown; name?: unknown }>(
  bancos: unknown,
  limite = 20
): T[] {
  if (!Array.isArray(bancos)) {
    throw new TypeError('A resposta da Brasil API não é uma lista.');
  }

  const selecionados: T[] = [];
  for (let i = 0; i < bancos.length && selecionados.length < limite; i++) {
    const banco = bancos[i] as T;
    if (banco.code && banco.name) {
      selecionados.push(banco);
    }
  }

  return selecionados;
}
