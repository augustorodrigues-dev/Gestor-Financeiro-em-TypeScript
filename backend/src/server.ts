import express from 'express';
import cors from 'cors';
import { getBanks } from './services/brasilApiService';
import { convertCurrency } from './services/exchangeService';
import { ReportService } from './services/ReportService';
import transactionRoutes from './routes/transaction.routes';
import accountRoutes from './routes/account.routes';
import userRoutes from './routes/user.routes';
import categoryRoutes from './routes/category.routes';
import creditCardRoutes from './routes/creditcard.routes';
import goalRoutes from './routes/goal.routes';
import { authMiddleware } from './middlewares/authMiddleware';
import { prisma } from './prisma';

const app = express();
const reportService = new ReportService();

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

// UC10 — Consultar Cotação de Moeda (câmbio)
app.get('/api/exchange', async (req, res) => {
  try {
    const from = (req.query.from as string) || 'USD';
    const to = (req.query.to as string) || 'BRL';
    const amount = req.query.amount ? Number(req.query.amount) : 1;
    const result = await convertCurrency(from, to, amount);
    return res.json(result);
  } catch (error: any) {
    return res.status(503).json({ error: error.message || 'Erro ao consultar cotação.' });
  }
});

app.use('/api/transactions', transactionRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cards', creditCardRoutes);
app.use('/api/goals', goalRoutes);

// UC07 — Relatório financeiro consolidado (autenticado)
app.get('/api/reports/summary', authMiddleware, async (req, res) => {
  try {
    const summary = await reportService.getSummary(
      req.user.id,
      req.query.startDate as string,
      req.query.endDate as string
    );
    return res.json(summary);
  } catch (error: any) {
    return res.status(500).json({ error: 'Erro ao gerar o relatório.' });
  }
});

// UC19 — Alertas de contas próximas ao vencimento (autenticado)
app.get('/api/alerts/upcoming', authMiddleware, async (req, res) => {
  try {
    const days = req.query.days ? Number(req.query.days) : 7;
    const upcoming = await reportService.getUpcomingDue(req.user.id, days);
    return res.json(upcoming);
  } catch (error: any) {
    return res.status(500).json({ error: 'Erro ao buscar alertas de vencimento.' });
  }
});

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
