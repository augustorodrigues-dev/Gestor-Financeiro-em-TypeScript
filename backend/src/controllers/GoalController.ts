import { Request, Response } from 'express';
import { GoalService } from '../services/GoalService';

export class GoalController {
  private goalService: GoalService;

  constructor() {
    this.goalService = new GoalService();
  }

  async create(req: Request, res: Response) {
    try {
      const userId = req.user.id; // Assumindo que o authMiddleware injeta o usuário
      const { name, targetAmount, deadline } = req.body;

      if (!name || !targetAmount || !deadline) {
        return res.status(400).json({ error: 'Nome, valor alvo e prazo são obrigatórios.' });
      }

      const goal = await this.goalService.createGoal(userId, { name, targetAmount, deadline });
      return res.status(201).json(goal);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async list(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const goals = await this.goalService.getGoalsByUser(userId);
      return res.status(200).json(goals);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const goalId = parseInt(req.params.id, 10);
      const data = req.body;

      const updatedGoal = await this.goalService.updateGoal(goalId, userId, data);
      return res.status(200).json(updatedGoal);
    } catch (error: any) {
      if (error.message.includes('não encontrada')) {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const goalId = parseInt(req.params.id, 10);

      const result = await this.goalService.deleteGoal(goalId, userId);
      return res.status(200).json(result);
    } catch (error: any) {
      if (error.message.includes('não encontrada')) {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message });
    }
  }
}