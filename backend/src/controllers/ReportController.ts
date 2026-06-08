import { Request, Response } from 'express';
import { ReportService } from '../services/ReportService';

export class ReportController {
  private reportService: ReportService;

  constructor() {
    this.reportService = new ReportService();
  }

  async getMonthly(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const month = parseInt(req.query.month as string, 10);
      const year = parseInt(req.query.year as string, 10);

      if (isNaN(month) || isNaN(year)) {
        return res.status(400).json({ error: 'Mês e ano são obrigatórios na query (ex: ?month=5&year=2026).' });
      }

      const report = await this.reportService.getMonthlyReport(userId, month, year);
      return res.status(200).json(report);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}