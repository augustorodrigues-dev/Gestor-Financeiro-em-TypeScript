import { useState, useEffect } from 'react';
import { goalService } from '../services/goalService';

interface Goal {
  id: number;
  name: string;
  targetAmount: string | number;
  currentAmount: string | number;
  deadline: string;
  progress: number;
  completed: boolean;
}

export default function GoalManager() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');

  const load = async () => {
    try {
      const data = await goalService.getGoals();
      setGoals(Array.isArray(data) ? data : []);
    } catch (err: any) { setError(err.message); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await goalService.createGoal({ name, targetAmount: Number(targetAmount), deadline });
      setName(''); setTargetAmount(''); setDeadline('');
      load();
    } catch (err: any) { setError(err.message); }
  };

  const handleAporte = async (goal: Goal) => {
    const value = window.prompt(`Registrar aporte para "${goal.name}" (valor atual: R$ ${Number(goal.currentAmount).toFixed(2)}):`);
    if (value == null) return;
    const novo = Number(goal.currentAmount) + Number(value);
    try { await goalService.updateGoal(goal.id, { currentAmount: novo }); load(); } catch (err: any) { setError(err.message); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Cancelar esta meta?')) return;
    try { await goalService.deleteGoal(id); load(); } catch (err: any) { setError(err.message); }
  };

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6 animate-fade-in">
      <h2 className="mb-6 text-2xl font-bold tracking-tight text-neutral-800">Metas Financeiras</h2>

      {error && <div role="alert" className="mb-4 rounded-lg border-l-4 border-danger-400 bg-danger-50 px-4 py-3 text-danger-700">{error}</div>}

      <form onSubmit={handleCreate} className="mb-8 flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-5 shadow-card sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="goal-name" className="mb-1 block text-sm font-medium text-neutral-600">Objetivo</label>
          <input id="goal-name" required value={name} onChange={e => setName(e.target.value)} className="w-full rounded-lg border border-neutral-300 p-2.5 text-sm text-neutral-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30" placeholder="Ex: Viagem" />
        </div>
        <div className="sm:w-40">
          <label htmlFor="goal-target" className="mb-1 block text-sm font-medium text-neutral-600">Valor Alvo (R$)</label>
          <input id="goal-target" required type="number" step="0.01" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} className="w-full rounded-lg border border-neutral-300 p-2.5 text-sm outline-none focus:border-brand-500" />
        </div>
        <div className="sm:w-44">
          <label htmlFor="goal-deadline" className="mb-1 block text-sm font-medium text-neutral-600">Prazo</label>
          <input id="goal-deadline" required type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="w-full rounded-lg border border-neutral-300 p-2.5 text-sm outline-none focus:border-brand-500" />
        </div>
        <button type="submit" className="rounded-lg bg-brand-600 px-6 py-2.5 font-semibold text-white shadow-sm transition-all hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">Criar Meta</button>
      </form>

      <div className="space-y-4">
        {goals.map(goal => (
          <div key={goal.id} className="rounded-xl border border-neutral-200 bg-white p-5 shadow-card">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-bold text-neutral-800">{goal.completed ? '✅ ' : '🎯 '}{goal.name}</h3>
              <div className="flex gap-2">
                <button onClick={() => handleAporte(goal)} className="rounded bg-success-50 px-3 py-1 text-xs font-semibold text-success-700 hover:bg-success-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-success-500">+ Aporte</button>
                <button onClick={() => handleDelete(goal.id)} className="text-sm font-semibold text-danger-500 hover:text-danger-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-danger-500">Cancelar</button>
              </div>
            </div>
            <div className="mb-1 flex justify-between text-sm text-neutral-600">
              <span>R$ {Number(goal.currentAmount).toFixed(2)} de R$ {Number(goal.targetAmount).toFixed(2)}</span>
              <span className="font-semibold">{goal.progress}%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-neutral-100">
              <div className={`h-full rounded-full transition-all ${goal.completed ? 'bg-success-500' : 'bg-brand-500'}`} style={{ width: `${goal.progress}%` }} />
            </div>
            <p className="mt-2 text-xs text-neutral-400">Prazo: {new Date(goal.deadline).toLocaleDateString('pt-BR')}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
