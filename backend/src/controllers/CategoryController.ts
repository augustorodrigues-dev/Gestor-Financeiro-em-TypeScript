import { Request, Response } from 'express';
import { CategoryService } from '../services/CategoryService';

const categoryService = new CategoryService();

export class CategoryController {
  async create(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const { name, type, icon, color } = req.body;
      if (!name || !type) {
        return res.status(400).json({ error: 'Nome e tipo da categoria são obrigatórios.' });
      }
      const category = await categoryService.createCategory(userId, { name, type, icon, color });
      return res.status(201).json(category);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async list(req: Request, res: Response) {
    try {
      const categories = await categoryService.getCategoriesByUser(req.user.id);
      return res.status(200).json(categories);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: 'ID da categoria inválido.' });
      const updated = await categoryService.updateCategory(id, req.user.id, req.body);
      return res.status(200).json(updated);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: 'ID da categoria inválido.' });
      await categoryService.deleteCategory(id, req.user.id);
      return res.status(200).json({ message: 'Categoria excluída com sucesso.' });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}
