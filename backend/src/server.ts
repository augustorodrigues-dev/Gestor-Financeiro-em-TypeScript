import express from 'express';
import cors from 'cors';
import { getBanks } from './services/brasilApiService';
import { transactionRoutes } from './routes/transaction.routes';

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

app.get('/api/balance', (req, res) => {
  res.json({ balance: 1500.50, warning: "Mock mode - Falta integrar com Account" });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Backend do FinanceFlow rodando na porta ${PORT} (Conectado ao Neon Database)`);
});