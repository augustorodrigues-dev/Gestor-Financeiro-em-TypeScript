import express from 'express';
import cors from 'cors';
import { getBanks } from './services/brasilApiService'; // Nova importação

const app = express();
app.use(cors());
app.use(express.json());

let balance = 1500.50;
const transactions: any[] = [];

app.get('/api/banks', async (req, res) => {
  try {
    const banks = await getBanks();
    res.json({ success: true, banks });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar instituições financeiras' });
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