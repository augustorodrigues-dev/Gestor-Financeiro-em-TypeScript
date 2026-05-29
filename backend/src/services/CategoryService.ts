import { prisma } from '../prisma';

export class CategoryService {
  // CREATE — UC05
  async createCategory(userId: number, data: { name: string; type: string; icon?: string; color?: string }) {
    return await prisma.category.create({
      data: {
        name: data.name,
        type: data.type,
        icon: data.icon,
        color: data.color,
        isDefault: false,
        userId,
      },
    });
  }

  // READ — lista padrão + personalizadas do usuário
  async getCategoriesByUser(userId: number) {
    return await prisma.category.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
  }

  // UPDATE
  async updateCategory(categoryId: number, userId: number, data: { name?: string; icon?: string; color?: string }) {
    const category = await prisma.category.findFirst({ where: { id: categoryId, userId } });
    if (!category) throw new Error('Categoria não encontrada ou acesso negado.');

    return await prisma.category.update({
      where: { id: categoryId },
      data: { name: data.name, icon: data.icon, color: data.color },
    });
  }

  // DELETE — UC05: categorias padrão não podem ser removidas
  async deleteCategory(categoryId: number, userId: number) {
    const category = await prisma.category.findFirst({ where: { id: categoryId, userId } });
    if (!category) throw new Error('Categoria não encontrada.');
    if (category.isDefault) throw new Error('Categorias padrão não podem ser removidas.');

    return await prisma.category.delete({ where: { id: categoryId } });
  }
}
