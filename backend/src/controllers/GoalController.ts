import { Request, Response } from 'express';
import { GoalService } from '../services/GoalService';

const goalService = new GoalService();

export class GoalController {
  async create(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const { name, targetAmount, currentAmount, deadline } = req.body;
      if (!name || targetAmount == null || !deadline) {
        return res.status(400).json({ error: 'Nome, valor alvo e prazo são obrigatórios.' });
      }
      const goal = await goalService.createGoal(userId, {
        name,
        targetAmount: Number(targetAmount),
        currentAmount: currentAmount != null ? Number(currentAmount) : 0,
        deadline,
      });
      return res.status(201).json(goal);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async list(req: Request, res: Response) {
    try {
      const goals = await goalService.getGoalsByUser(req.user.id);
      return res.status(200).json(goals);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: 'ID da meta inválido.' });
      const data = { ...req.body };
      if (data.targetAmount != null) data.targetAmount = Number(data.targetAmount);
      if (data.currentAmount != null) data.currentAmount = Number(data.currentAmount);
      const updated = await goalService.updateGoal(id, req.user.id, data);
      return res.status(200).json(updated);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: 'ID da meta inválido.' });
      await goalService.deleteGoal(id, req.user.id);
      return res.status(200).json({ message: 'Meta excluída com sucesso.' });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}
