import express from 'express';
import cors from 'cors';
import { getBanks } from './services/brasilApiService';
import transactionRoutes from './routes/transaction.routes';
import accountRoutes from './routes/account.routes';
import userRoutes from './routes/user.routes'; 
import { prisma } from './prisma'; 

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
app.use('/api/accounts', accountRoutes); 
app.use('/api/users', userRoutes);

app.get('/api/balance/user/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: "ID de usuário inválido." });
    }

    const agregacaoSaldo = await prisma.account.aggregate({
      where: { userId },
      _sum: {
        balance: true
      }
    });

    const saldoTotal = agregacaoSaldo._sum.balance ?? 0.0;

    return res.json({ success: true, balance: saldoTotal });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao calcular o saldo consolidado do usuário' });
  }
});

const PORT = process.env.PORT || 3001;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Backend do FinanceFlow rodando na porta ${PORT} (Conectado ao PostgreSQL)`);
  });
}

export { app };