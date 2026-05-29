import { useState, useEffect } from 'react';
import { accountService } from '../services/accountService';
import { createTransaction } from '../services/transactionService';
import { creditCardService } from '../services/creditCardService';
import CreditCardManager from '../components/CreditCardManager';

interface Bank {
  ispb: string;
  name: string;
  code: number;
}

interface WalletProps {
  userId: number;
}

export default function Wallet({ userId }: WalletProps) {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [creditCards, setCreditCards] = useState<any[]>([]);
  const [officialBanks, setOfficialBanks] = useState<Bank[]>([]);

  // Estados da Transação
  const [txDesc, setTxDesc] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txType, setTxType] = useState('EXPENSE');
  const [txAccountId, setTxAccountId] = useState('');
  const [txCreditCardId, setTxCreditCardId] = useState('');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);

  // Estados da Conta
  const [selectedBankName, setSelectedBankName] = useState('');
  const [accountType, setAccountType] = useState('CORRENTE');

  const loadWalletData = async () => {
    try {
      const [contas, bancosFiltro, cartoes] = await Promise.all([
        accountService.getUserAccounts(),
        accountService.getBanks(),
        creditCardService.getCards()
      ]);

      const listaContas = Array.isArray(contas) ? contas : [];
      setAccounts(listaContas);
      setOfficialBanks(Array.isArray(bancosFiltro) ? bancosFiltro.filter((b: Bank) => b.name) : []);
      setCreditCards(Array.isArray(cartoes) ? cartoes : []);

      if (listaContas.length > 0 && !txAccountId) {
        setTxAccountId(listaContas[0].id.toString());
      }
    } catch (error) {
      console.error("Erro ao carregar dados da carteira:", error);
    }
  };

  useEffect(() => { loadWalletData(); }, [userId]);

  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txAccountId) return alert("Crie uma conta primeiro!");

    const payload = {
      description: txDesc,
      amount: Number(txAmount),
      type: txType,
      accountId: Number(txAccountId),
      creditCardId: txCreditCardId ? Number(txCreditCardId) : null,
      date: new Date(txDate).toISOString(),
    };

    try {
      await createTransaction(payload);
      alert('✅ Transação registrada com sucesso!');
      setTxDesc(''); setTxAmount(''); setTxCreditCardId('');
      loadWalletData();
    } catch (error: any) { alert(error.message); }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBankName) return alert("Selecione uma instituição financeira.");

    try {
      await accountService.createAccount({
        name: selectedBankName,
        balance: 0,
        type: accountType,
        userId
      });
      setSelectedBankName('');
      setAccountType('CORRENTE');
      alert('🏛️ Nova conta vinculada com sucesso!');
      loadWalletData();
    } catch (error: any) { alert(error.message); }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 animate-fade-in p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-800">Minha Carteira</h1>
        <p className="text-neutral-500">Registre novas movimentações, vincule contas e gerencie seus cartões.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Formulário de Transação */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-card">
          <h3 className="mb-4 font-bold text-neutral-800">Nova Transação</h3>
          <form onSubmit={handleSaveTransaction} className="space-y-4">
            <input required type="text" placeholder="Ex: Supermercado" value={txDesc} onChange={e => setTxDesc(e.target.value)} className="w-full rounded-lg border p-2.5 text-sm outline-none focus:border-brand-500" />
            
            <div className="flex gap-2">
              <input required type="number" step="0.01" placeholder="R$ 0,00" value={txAmount} onChange={e => setTxAmount(e.target.value)} className="w-2/3 rounded-lg border p-2.5 text-sm outline-none focus:border-brand-500" />
              <select value={txType} onChange={e => setTxType(e.target.value)} disabled={!!txCreditCardId} className={`w-1/3 rounded-lg border p-2.5 text-sm font-semibold outline-none ${txType === 'INCOME' ? 'text-success-600' : 'text-danger-600'} ${txCreditCardId ? 'bg-neutral-100 opacity-70' : 'bg-white'}`}>
                <option value="EXPENSE">Despesa</option>
                <option value="INCOME">Receita</option>
              </select>
            </div>

            <select value={txAccountId} onChange={e => setTxAccountId(e.target.value)} className="w-full rounded-lg border p-2.5 text-sm outline-none focus:border-brand-500">
              {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} (Saldo base)</option>)}
            </select>

            <select value={txCreditCardId} onChange={e => { setTxCreditCardId(e.target.value); if (e.target.value) setTxType('EXPENSE'); }} className="w-full rounded-lg border p-2.5 text-sm outline-none focus:border-brand-500">
              <option value="">Débito / PIX / Dinheiro Vivo</option>
              {creditCards.map(card => <option key={card.id} value={card.id}>💳 {card.name}</option>)}
            </select>

            <input required type="date" value={txDate} onChange={e => setTxDate(e.target.value)} className="w-full rounded-lg border p-2.5 text-sm outline-none focus:border-brand-500" />
            
            <button type="submit" className="w-full rounded-lg bg-brand-600 py-2.5 font-bold text-white transition-colors hover:bg-brand-700">Salvar Transação</button>
          </form>
        </div>

        {/* Formulário de Conta */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-card">
          <h3 className="mb-4 font-bold text-neutral-800">Vincular Conta Financeira</h3>
          <form onSubmit={handleCreateAccount} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-500">Instituição (Brasil API)</label>
              <select required value={selectedBankName} onChange={e => setSelectedBankName(e.target.value)} className="w-full rounded-lg border p-2.5 text-sm outline-none focus:border-brand-500">
                <option value="" disabled>Selecione o banco...</option>
                <option value="Outro / Carteira Física">Outro (Carteira Física / Espécie)</option>
                {officialBanks.map((bank, index) => (
                  <option key={index} value={bank.name}>{bank.code ? `${bank.code} - ` : ''}{bank.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-500">Tipo de Conta</label>
              <select value={accountType} onChange={e => setAccountType(e.target.value)} className="w-full rounded-lg border p-2.5 text-sm outline-none focus:border-brand-500">
                <option value="CORRENTE">Conta Corrente</option>
                <option value="POUPANCA">Poupança</option>
                <option value="CARTEIRA">Carteira / Dinheiro Vivo</option>
              </select>
            </div>
            <button type="submit" className="w-full rounded-lg bg-neutral-800 py-2.5 font-bold text-white transition-colors hover:bg-neutral-900">+ Adicionar Conta Oficial</button>
          </form>
        </div>
      </div>

      {/* Gerenciador de Cartões */}
      <CreditCardManager cards={creditCards} onUpdate={loadWalletData} />
    </div>
  );
}