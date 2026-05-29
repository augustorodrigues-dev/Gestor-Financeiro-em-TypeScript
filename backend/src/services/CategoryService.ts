import { prisma } from '../prisma';

interface CategoryDTO {
  name: string;
  type: string;
  color?: string;
  icon?: string; 
}

export class CategoryService {
  async createCategory(userId: number, data: CategoryDTO) {
    return await prisma.category.create({
      data: {
        name: data.name,
        type: data.type,
        color: data.color,
        icon: data.icon,
        isDefault: false, 
        userId: userId,
      },
    });
  }

  async getCategories(userId: number) {
    return await prisma.category.findMany({
      where: {
        OR: [
          { isDefault: true }, 
          { userId: userId }   
        ]
      },
      orderBy: {
        name: 'asc'
      }
    });
  }

  async updateCategory(categoryId: number, userId: number, data: CategoryDTO) {
    const existingCategory = await prisma.category.findFirst({
      where: { id: categoryId, userId: userId },
    });

    if (!existingCategory) {
      throw new Error('Categoria não encontrada ou não pertence a você.');
    }

    if (existingCategory.isDefault) {
      throw new Error('Categorias padrão do sistema não podem ser alteradas.');
    }

    return await prisma.category.update({
      where: { id: categoryId },
      data: {
        name: data.name,
        type: data.type,
        color: data.color,
        icon: data.icon,
      },
    });
  }

  async deleteCategory(categoryId: number, userId: number) {
    const existingCategory = await prisma.category.findFirst({
      where: { id: categoryId, userId: userId },
    });

    if (!existingCategory) {
      throw new Error('Categoria não encontrada ou não pertence a você.');
    }

    if (existingCategory.isDefault) {
      throw new Error('Categorias padrão não podem ser removidas.');
    }

    // Retorna o objeto deletado, permitindo que o teste acesse .id
    return await prisma.category.delete({
      where: { id: categoryId },
    });
  }
}