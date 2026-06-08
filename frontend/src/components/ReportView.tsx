import { useEffect, useState } from 'react';
import { getMonthlyReport } from '../services/reportService';

export function ReportView() {
  const [report, setReport] = useState<any>(null);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReport();
  }, [month, year]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const data = await getMonthlyReport(month, year);
      setReport(data);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 bg-white rounded-xl shadow-md border mt-4">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">📉 Relatório Financeiro Mensal</h2>
        
        {/* Filtros de Mês e Ano */}
        <div className="flex gap-2">
          <select 
            className="border p-2 rounded bg-gray-50 font-medium text-sm focus:outline-blue-500" 
            value={month} 
            onChange={e => setMonth(Number(e.target.value))}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>Mês {i + 1}</option>
            ))}
          </select>
          <input 
            type="number" 
            className="border p-2 rounded bg-gray-50 font-medium text-sm w-24 focus:outline-blue-500" 
            value={year} 
            onChange={e => setYear(Number(e.target.value))} 
          />
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500 text-center py-6 font-medium">Buscando dados no servidor...</p>
      ) : report ? (
        <>
          {/* Indicadores Consolidados */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-5 rounded-xl border border-green-200">
              <p className="text-green-800 text-xs font-bold uppercase tracking-wider">Total Receitas</p>
              <h3 className="text-xl font-black text-green-600 mt-1">{formatCurrency(report.summary.totalIncome)}</h3>
            </div>
            <div className="bg-red-50 p-5 rounded-xl border border-red-200">
              <p className="text-red-800 text-xs font-bold uppercase tracking-wider">Total Despesas</p>
              <h3 className="text-xl font-black text-red-600 mt-1">{formatCurrency(report.summary.totalExpense)}</h3>
            </div>
            <div className={`p-5 rounded-xl border ${report.summary.balance >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'}`}>
              <p className={`text-xs font-bold uppercase tracking-wider ${report.summary.balance >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>Balanço Geral</p>
              <h3 className={`text-xl font-black mt-1 ${report.summary.balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                {formatCurrency(report.summary.balance)}
              </h3>
            </div>
          </div>

          {/* Listagem com Barras Proporcionais */}
          <div className="pt-4">
            <h3 className="text-lg font-bold mb-4 text-gray-700">Gastos Proporcionais por Categoria</h3>
            
            {report.expenseByCategory.length === 0 ? (
              <p className="text-gray-400 text-sm italic">Nenhum registro de saída encontrado neste período.</p>
            ) : (
              <div className="space-y-4">
                {report.expenseByCategory.map((cat: any) => {
                  // Calcula a porcentagem do gasto frente ao total de despesas
                  const totalExpense = report.summary.totalExpense || 1;
                  const percentage = Math.min(Math.round((cat.amount / totalExpense) * 100), 100);
                  
                  return (
                    <div key={cat.name} className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-sm font-semibold text-gray-600">
                        <span className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full inline-block shadow-sm" style={{ backgroundColor: cat.color || '#ccc' }}></span>
                          {cat.name}
                        </span>
                        <span className="text-gray-800">{formatCurrency(cat.amount)} <span className="text-xs text-gray-400">({percentage}%)</span></span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden border border-gray-200/50">
                        <div 
                          className="h-full rounded-full transition-all duration-500 ease-out" 
                          style={{ width: `${percentage}%`, backgroundColor: cat.color || '#3b82f6' }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}