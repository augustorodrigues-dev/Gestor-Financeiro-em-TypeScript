import { Request, Response } from 'express';
import { CategoryService } from '../services/CategoryService';

export class CategoryController {
  private categoryService: CategoryService;

  constructor() {
    this.categoryService = new CategoryService();
  }

  async create(req: Request, res: Response) {
    try {
      const userId = req.user.id; 
      const { name, type, color, icon } = req.body;

      if (!name || !type) {
        return res.status(400).json({ error: 'Nome e tipo da categoria são obrigatórios.' });
      }

      const category = await this.categoryService.createCategory(userId, { name, type, color, icon });
      return res.status(201).json(category);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async list(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const categories = await this.categoryService.getCategories(userId);
      return res.status(200).json(categories);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const categoryId = parseInt(req.params.id, 10);
      const data = req.body;

      const updatedCategory = await this.categoryService.updateCategory(categoryId, userId, data);
      return res.status(200).json(updatedCategory);
    } catch (error: any) {
      if (error.message.includes('padrão não podem ser')) {
        return res.status(403).json({ error: error.message });
      }
      return res.status(404).json({ error: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const categoryId = parseInt(req.params.id, 10);

      const result = await this.categoryService.deleteCategory(categoryId, userId);
      return res.status(200).json(result);
    } catch (error: any) {
      if (error.message.includes('padrão não podem ser')) {
        return res.status(403).json({ error: error.message }); // HTTP 403: Forbidden
      }
      return res.status(404).json({ error: error.message });
    }
  }
}