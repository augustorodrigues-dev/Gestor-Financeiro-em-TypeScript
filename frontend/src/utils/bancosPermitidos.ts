export function filtrarBancosPermitidos<T extends { code?: unknown }>(
  data: unknown,
  bancosPermitidos: ReadonlyArray<{ code: number }>
): T[] {
  if (!Array.isArray(data)) {
    return [];
  }

  const codigosPermitidos = new Set<number>();
  for (const banco of bancosPermitidos) {
    codigosPermitidos.add(banco.code);
  }

  return data.filter((bank: T) => codigosPermitidos.has(bank.code as number));
}
