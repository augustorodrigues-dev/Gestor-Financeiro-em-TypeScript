import { CategoryService } from '../../src/services/CategoryService';
import { prisma } from '../../src/prisma';

jest.mock('../../src/prisma', () => ({
  prisma: {
    category: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('CategoryService - Regras de Negócio', () => {
  const categoryService = new CategoryService();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('1. Deve criar uma categoria personalizada sempre com isDefault = false', async () => {
    (prisma.category.create as jest.Mock).mockResolvedValue({ id: 50, name: 'Lazer' });

    await categoryService.createCategory(1, { name: 'Lazer', type: 'EXPENSE', color: '#FF0000' });

    expect(prisma.category.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ name: 'Lazer', isDefault: false, userId: 1 }),
      }),
    );
  });

  it('2. Deve listar categorias padrão e do usuário (cláusula OR)', async () => {
    (prisma.category.findMany as jest.Mock).mockResolvedValue([{ id: 1 }, { id: 2 }]);

    const result = await categoryService.getCategories(1);

    expect(result).toHaveLength(2);
    expect(prisma.category.findMany).toHaveBeenCalledTimes(1);
  });

  it('3. Deve bloquear a atualização de uma categoria de outro usuário', async () => {
    (prisma.category.findFirst as jest.Mock).mockResolvedValue(null);

    await expect(categoryService.updateCategory(5, 1, { name: 'X', type: 'EXPENSE' }))
      .rejects.toThrow('Categoria não encontrada ou não pertence a você.');
  });

  it('4. Deve bloquear a alteração de uma categoria padrão do sistema', async () => {
    (prisma.category.findFirst as jest.Mock).mockResolvedValue({ id: 1, isDefault: true, userId: 1 });

    await expect(categoryService.updateCategory(1, 1, { name: 'X', type: 'EXPENSE' }))
      .rejects.toThrow('Categorias padrão do sistema não podem ser alteradas.');

    expect(prisma.category.update).not.toHaveBeenCalled();
  });

  it('5. Deve atualizar com sucesso uma categoria personalizada válida', async () => {
    (prisma.category.findFirst as jest.Mock).mockResolvedValue({ id: 10, isDefault: false, userId: 1 });
    (prisma.category.update as jest.Mock).mockResolvedValue({ id: 10, name: 'Atualizada' });

    const result = await categoryService.updateCategory(10, 1, { name: 'Atualizada', type: 'EXPENSE' });

    expect(result.name).toBe('Atualizada');
    expect(prisma.category.update).toHaveBeenCalledTimes(1);
  });

  it('6. Deve lançar erro ao tentar excluir categoria padrão (UC05)', async () => {
    (prisma.category.findFirst as jest.Mock).mockResolvedValue({ id: 1, isDefault: true, userId: 1 });

    await expect(categoryService.deleteCategory(1, 1))
      .rejects.toThrow('Categorias padrão não podem ser removidas.');
  });

  it('7. Deve lançar erro ao tentar excluir categoria de outro usuário (Segurança)', async () => {
    (prisma.category.findFirst as jest.Mock).mockResolvedValue(null);

    await expect(categoryService.deleteCategory(5, 1))
      .rejects.toThrow('Categoria não encontrada ou não pertence a você.');
  });

  it('8. Deve excluir com sucesso uma categoria válida', async () => {
    (prisma.category.findFirst as jest.Mock).mockResolvedValue({ id: 10, userId: 1, isDefault: false });
    (prisma.category.delete as jest.Mock).mockResolvedValue({ id: 10 });

    const result = await categoryService.deleteCategory(10, 1);

    expect(prisma.category.delete).toHaveBeenCalledWith({ where: { id: 10 } });
    expect(result.id).toBe(10);
  });
});
