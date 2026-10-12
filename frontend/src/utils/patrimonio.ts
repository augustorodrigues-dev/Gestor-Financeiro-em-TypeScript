export function calcularPatrimonio(contas: ReadonlyArray<{ balance: unknown }>): number {
  return contas.reduce((acc, conta) => acc + Number(conta.balance), 0);
}
