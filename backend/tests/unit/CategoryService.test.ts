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

const prismaMock = prisma as unknown as { category: Record<string, jest.Mock> };

describe('Unitário: CategoryService', () => {
  const service = new CategoryService();
  beforeEach(() => jest.clearAllMocks());

  it('cria categoria como não-padrão vinculada ao usuário', async () => {
    prismaMock.category.create.mockResolvedValue({ id: 1 });
    await service.createCategory(7, { name: 'Lazer', type: 'EXPENSE', icon: '🎮', color: '#fff' });
    expect(prismaMock.category.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ isDefault: false, userId: 7 }) })
    );
  });

  it('lista categorias do usuário', async () => {
    prismaMock.category.findMany.mockResolvedValue([{ id: 1 }]);
    expect(await service.getCategoriesByUser(7)).toHaveLength(1);
  });

  it('atualiza quando pertence ao usuário', async () => {
    prismaMock.category.findFirst.mockResolvedValue({ id: 1, userId: 7 });
    prismaMock.category.update.mockResolvedValue({ id: 1, name: 'X' });
    await service.updateCategory(1, 7, { name: 'X' });
    expect(prismaMock.category.update).toHaveBeenCalled();
  });

  it('nega update de categoria de terceiro', async () => {
    prismaMock.category.findFirst.mockResolvedValue(null);
    await expect(service.updateCategory(1, 7, { name: 'X' })).rejects.toThrow('acesso negado');
  });

  it('bloqueia exclusão de categoria padrão', async () => {
    prismaMock.category.findFirst.mockResolvedValue({ id: 1, isDefault: true });
    await expect(service.deleteCategory(1, 7)).rejects.toThrow('padrão não podem ser removidas');
    expect(prismaMock.category.delete).not.toHaveBeenCalled();
  });

  it('exclui categoria personalizada', async () => {
    prismaMock.category.findFirst.mockResolvedValue({ id: 1, isDefault: false });
    prismaMock.category.delete.mockResolvedValue({ id: 1 });
    await service.deleteCategory(1, 7);
    expect(prismaMock.category.delete).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it('erro ao excluir categoria inexistente', async () => {
    prismaMock.category.findFirst.mockResolvedValue(null);
    await expect(service.deleteCategory(1, 7)).rejects.toThrow('não encontrada');
  });
});
