export async function limparTudo(prisma: any): Promise<void> {
  await prisma.transaction.deleteMany();
  await prisma.creditCard.deleteMany();
  await prisma.category.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
}

export async function contarRegistros(prisma: any): Promise<number> {
  const contagens = await Promise.all([
    prisma.user.count(),
    prisma.account.count(),
    prisma.category.count(),
    prisma.creditCard.count(),
    prisma.transaction.count(),
  ]);
  return contagens.reduce((total: number, valor: number) => total + valor, 0);
}

export async function criarUsuario(prisma: any, email = 'bench@bench.local') {
  return prisma.user.create({
    data: { name: 'Bench', email, passwordHash: 'x' },
  });
}

export async function criarConta(prisma: any, userId: number, nome = 'Conta') {
  return prisma.account.create({
    data: { name: nome, type: 'CORRENTE', userId },
  });
}

export async function inserirEmLotes<T>(
  dados: T[],
  inserir: (lote: T[]) => Promise<unknown>,
  tamanhoLote = 2000
): Promise<void> {
  for (let i = 0; i < dados.length; i += tamanhoLote) {
    await inserir(dados.slice(i, i + tamanhoLote));
  }
}

export function valorEmCentavos(i: number): number {
  return ((i * 37) % 100000) / 100;
}
