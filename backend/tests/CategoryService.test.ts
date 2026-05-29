import { CategoryService } from '../src/services/CategoryService';
import { prisma } from '../src/prisma';

jest.mock('../src/prisma', () => ({
  prisma: {
    category: {
      findFirst: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('CategoryService - Regras de Negócio', () => {
  const categoryService = new CategoryService();

  it('Deve lançar erro ao tentar excluir categoria padrão (UC05)', async () => {
    (prisma.category.findFirst as jest.Mock).mockResolvedValue({
      id: 1, isDefault: true
    });

    await expect(categoryService.deleteCategory(1, 1))
      .rejects.toThrow('Categorias padrão não podem ser removidas.');
  });
});