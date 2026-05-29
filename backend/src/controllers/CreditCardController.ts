import { Request, Response } from 'express';
import { CreditCardService } from '../services/CreditCardService';

const creditCardService = new CreditCardService();

export class CreditCardController {
  async create(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const { name, limitAmount, closingDay, dueDay } = req.body;
      if (!name || limitAmount == null || closingDay == null || dueDay == null) {
        return res.status(400).json({ error: 'Nome, limite, dia de fechamento e vencimento são obrigatórios.' });
      }
      const card = await creditCardService.createCard(userId, {
        name,
        limitAmount: Number(limitAmount),
        closingDay: Number(closingDay),
        dueDay: Number(dueDay),
      });
      return res.status(201).json(card);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async list(req: Request, res: Response) {
    try {
      const cards = await creditCardService.getCardsByUser(req.user.id);
      return res.status(200).json(cards);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: 'ID do cartão inválido.' });
      const data = { ...req.body };
      if (data.limitAmount != null) data.limitAmount = Number(data.limitAmount);
      if (data.closingDay != null) data.closingDay = Number(data.closingDay);
      if (data.dueDay != null) data.dueDay = Number(data.dueDay);
      const updated = await creditCardService.updateCard(id, req.user.id, data);
      return res.status(200).json(updated);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: 'ID do cartão inválido.' });
      await creditCardService.deleteCard(id, req.user.id);
      return res.status(200).json({ message: 'Cartão excluído com sucesso.' });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}
