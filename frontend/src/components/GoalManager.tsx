import React, { useEffect, useState } from 'react';
import { goalService } from '../services/goalService';

export function GoalManager() {
  const [goals, setGoals] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = () => {
    goalService.getGoals()
      .then((data) => {
        if (data && data.error) {
          console.error("Erro da API:", data.error);
          return;
        }
        setGoals(data);
      })
      .catch(err => console.error("Erro na conexão ao carregar metas:", err));
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await goalService.createGoal({
        name,
        targetAmount: Number(targetAmount),
        deadline
      });

      if (response && response.error) {
        alert(`❌ O servidor recusou a criação:\n${response.error}`);
        return; 
      }

      setName('');
      setTargetAmount('');
      setDeadline('');
      loadGoals();
      alert('✅ Meta financeira criada com sucesso!');
    } catch (error: any) {
      alert(`⚠️ Erro de conexão ou servidor offline: ${error.message}`);
    }
  };

  const handleAddProgress = async (goal: any) => {
    const value = window.prompt(`Quanto você quer investir na meta "${goal.name}" agora?`);
    
    if (value && !isNaN(Number(value))) {
      const newAmount = Number(goal.currentAmount) + Number(value);
      try {
        const response = await goalService.addProgress(goal.id, newAmount);
        
        if (response && response.error) {
          alert(`❌ Erro ao registrar aporte:\n${response.error}`);
          return;
        }

        loadGoals();
      } catch (error: any) {
        alert(`⚠️ Erro de conexão: ${error.message}`);
      }
    } else if (value) {
      alert('Por favor, digite um valor numérico válido.');
    }
  };

  const handleDeleteGoal = async (id: number) => {
    if (window.confirm('Tem certeza que deseja cancelar esta meta?')) {
      try {
        const response = await goalService.deleteGoal(id);
        
        if (response && response.error) {
          alert(`❌ Erro ao deletar meta:\n${response.error}`);
          return;
        }

        loadGoals();
      } catch (error: any) {
        alert(`⚠️ Erro de conexão: ${error.message}`);
      }
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">🎯 Metas Financeiras</h2>
      
      {}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-200">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">Criar Nova Meta</h3>
        <form onSubmit={handleCreateGoal} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">Nome da Meta</label>
            <input 
              type="text" 
              required
              placeholder="Ex: Viagem para o Japão" 
              className="p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">Valor Alvo (R$)</label>
            <input 
              type="number" 
              required
              step="0.01" 
              placeholder="15000" 
              className="p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">Prazo Final</label>
            <input 
              type="date" 
              required
              className="p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>

          <div className="md:col-span-3 flex justify-end mt-2">
            <button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition-colors"
            >
              Salvar Meta
            </button>
          </div>
        </form>
      </div>

      {}
      <div className="grid grid-cols-1 gap-6">
        {goals.map(goal => (
          <div key={goal.id} className="bg-white p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-xl text-gray-800">{goal.name}</h3>
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                Prazo: {new Date(goal.deadline).toLocaleDateString('pt-BR')}
              </span>
            </div>
            
            <p className="text-gray-600 mb-4">
              Progresso: <span className="font-semibold text-green-600">R$ {goal.currentAmount}</span> de R$ {goal.targetAmount}
            </p>
            
            {}
            <div className="w-full bg-gray-200 rounded-full h-4 mb-2 overflow-hidden">
              <div 
                className={`h-4 transition-all duration-500 ease-out ${goal.isCompleted ? 'bg-green-500' : 'bg-blue-500'}`} 
                style={{ width: `${Math.min(goal.progressPercentage, 100)}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 text-right mb-4">{goal.progressPercentage}% Concluído</p>

            {/* Botões de Ação */}
            <div className="flex gap-3 border-t pt-4">
              <button 
                onClick={() => handleAddProgress(goal)}
                className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 font-medium py-2 px-4 rounded border border-green-200 transition-colors"
              >
                + Adicionar Aporte
              </button>
              <button 
                onClick={() => handleDeleteGoal(goal.id)}
                className="bg-red-50 hover:bg-red-100 text-red-600 font-medium py-2 px-4 rounded border border-red-200 transition-colors"
              >
                Cancelar Meta
              </button>
            </div>
          </div>
        ))}

        {!goals.length && (
          <p className="text-center text-gray-500 py-8">Você ainda não possui metas cadastradas.</p>
        )}
      </div>
    </div>
  );
}