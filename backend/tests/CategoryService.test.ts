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

  beforeEach(() => {
    jest.clearAllMocks(); 
  });

  it('1. Deve lançar erro ao tentar excluir categoria padrão (UC05)', async () => {
    (prisma.category.findFirst as jest.Mock).mockResolvedValue({
      id: 1, isDefault: true, userId: 1
    });

    await expect(categoryService.deleteCategory(1, 1))
      .rejects.toThrow('Categorias padrão não podem ser removidas.');
  });

  it('2. Deve lançar erro ao tentar excluir categoria de outro usuário (Segurança)', async () => {
    (prisma.category.findFirst as jest.Mock).mockResolvedValue(null);

    await expect(categoryService.deleteCategory(5, 1))
      .rejects.toThrow('Categoria não encontrada ou não pertence a você.');
  });

  it('3. Deve excluir com sucesso uma categoria válida', async () => {
    (prisma.category.findFirst as jest.Mock).mockResolvedValue({
      id: 10, userId: 1, isDefault: false
    });
    
    (prisma.category.delete as jest.Mock).mockResolvedValue({ id: 10 });

    const result = await categoryService.deleteCategory(10, 1);

    expect(prisma.category.delete).toHaveBeenCalledWith({ where: { id: 10 } });
    expect(result.id).toBe(10);
  });
});