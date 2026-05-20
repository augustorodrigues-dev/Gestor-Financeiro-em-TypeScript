import express from 'express';
import cors from 'cors';
import { getBanks } from './services/brasilApiService';
import { transactionRoutes } from './routes/transaction.routes';
// import { accountRoutes } from './routes/account.routes'; // Descomente quando for usar o CRUD de contas

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/banks', async (req, res) => {
  try {
    const banks = await getBanks();
    res.json({ success: true, banks });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar instituições financeiras' });
  }
});

app.use('/api/transactions', transactionRoutes);
// app.use('/api/accounts', accountRoutes); // Descomente quando for usar o CRUD de contas

app.get('/api/balance', (req, res) => {
  res.json({ balance: 1500.50, warning: "Mock mode - Falta integrar com Account" });
});

const PORT = process.env.PORT || 3001;

// MUDANÇA PARA OS TESTES (JEST):
// O servidor só vai ocupar a porta 3001 se o ambiente NÃO for de teste.
// Como o Jest define o NODE_ENV como 'test' automaticamente, isso evita o erro EADDRINUSE (porta em uso).
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Backend do FinanceFlow rodando na porta ${PORT} (Conectado ao PostgreSQL)`);
  });
}

// CRÍTICO PARA O SUPERTEST:
// Exportamos a instância do app para que o teste consiga simular as requisições HTTP
export { app };