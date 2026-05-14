import express from 'express';
import cors from 'cors';
import { getExchangeRates } from './services/exchangeService';

const app = express();
app.use(cors());
app.use(express.json());

let balance = 1500.50;
const transactions: any[] = [];

app.get('/api/exchange', async (req, res) => {
  try {
    const rates = await getExchangeRates();
    res.json({ success: true, rates });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar cotações' });
  }
});

app.get('/api/balance', (req, res) => {
  res.json({ balance });
});

app.post('/api/transactions', (req, res) => {
  const { amount, description, type } = req.body;
  
  const newTransaction = {
    id: Date.now(),
    amount,
    description,
    type,
    date: new Date()
  };
  
  transactions.push(newTransaction);
  
  balance += type === 'INCOME' ? amount : -amount;
  
  res.json({ success: true, balance, transaction: newTransaction });
});

app.listen(3001, () => {
  console.log('Backend do FinanceFlow rodando na porta 3001 (Mock Mode)');
});