export interface ItemExtrato<T, C> {
  tx: T;
  categoria: C | undefined;
  nomeConta: string;
}

export function montarExtrato<
  T extends { categoryId?: unknown; accountId?: unknown },
  C extends { id: unknown },
  A extends { id: unknown; name?: string }
>(transactions: T[], categories: C[], accounts: A[]): ItemExtrato<T, C>[] {
  const categoriasPorId = new Map<unknown, C>();
  for (const categoria of categories) {
    if (!categoriasPorId.has(categoria.id)) {
      categoriasPorId.set(categoria.id, categoria);
    }
  }

  const contasPorId = new Map<unknown, A>();
  for (const conta of accounts) {
    if (!contasPorId.has(conta.id)) {
      contasPorId.set(conta.id, conta);
    }
  }

  return transactions.map(tx => ({
    tx,
    categoria: categoriasPorId.get(tx.categoryId),
    nomeConta: contasPorId.get(tx.accountId)?.name || 'Conta'
  }));
}
