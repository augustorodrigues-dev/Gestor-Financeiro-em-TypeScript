import { Request, Response } from 'express';
import { CreditCardService } from '../services/CreditCardService';

const creditCardService = new CreditCardService();

export class CreditCardController {
  
  async create(req: Request, res: Response) {
    try {
      const { name, limitAmount, closingDay, dueDay } = req.body; // 🚀 Captura limitAmount
      const userId = req.user.id;

      if (!name || !limitAmount || !closingDay || !dueDay) {
        return res.status(400).json({ error: "Todos os campos são obrigatórios." });
      }

      const card = await creditCardService.createCard({
        name,
        limitAmount: Number(limitAmount),
        closingDay: Number(closingDay),
        dueDay: Number(dueDay),
        userId
      });

      return res.status(201).json(card);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async list(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const cards = await creditCardService.getCardsByUser(userId);
      return res.status(200).json(cards);
    } catch (error: any) {
      return res.status(500).json({ error: "Erro ao buscar cartões." });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const card = await creditCardService.updateCard(id, req.body);
      return res.status(200).json(card);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      await creditCardService.deleteCard(id);
      return res.status(200).json({ message: "Cartão removido com sucesso." });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}