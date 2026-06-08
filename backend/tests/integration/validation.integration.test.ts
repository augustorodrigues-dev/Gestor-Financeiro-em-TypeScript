import request from 'supertest';
import { app } from '../../src/server';
import { prisma } from '../../src/prisma';

/**
 * Suíte focada em validações de entrada e tratamento de erros das camadas
 * Controller/Middleware (caminhos negativos), garantindo a cobertura dos
 * ramos de exceção (HTTP 400/401/403/404) exigidos pela estratégia de testes.
 */
describe('Integração: Validações e Tratamento de Erros', () => {
  let token: string;
  let jadaoId: number;
  let categoriaPadraoId: number;

  beforeAll(async () => {
    const res = await request(app).post('/api/users/login').send({
      email: 'jadao@gmail.com',
      password: '1234',
    });
    token = res.body.token;
    jadaoId = res.body.user.id;

    // Cria uma categoria "do sistema" (isDefault) para validar a trava de exclusão.
    const padrao = await prisma.category.create({
      data: { name: 'Sistema (Teste)', type: 'EXPENSE', isDefault: true, userId: jadaoId },
    });
    categoriaPadraoId = padrao.id;
  });

  afterAll(async () => {
    await prisma.category.deleteMany({ where: { id: categoriaPadraoId } });
    await prisma.$disconnect();
  });

  // ---------------- Autenticação ----------------
  it('Deve recusar token inválido com 401 (authMiddleware)', async () => {
    const res = await request(app)
      .get('/api/accounts')
      .set('Authorization', 'Bearer token_invalido_xyz');
    expect(res.status).toBe(401);
  });

  // ---------------- Usuários (login) ----------------
  it('Login: deve exigir e-mail e senha (400)', async () => {
    const res = await request(app).post('/api/users/login').send({ email: 'x@x.com' });
    expect(res.status).toBe(400);
  });

  it('Login: deve recusar credenciais inválidas (401)', async () => {
    const res = await request(app).post('/api/users/login').send({
      email: 'jadao@gmail.com',
      password: 'senha_errada',
    });
    expect(res.status).toBe(401);
  });

  it('Login: deve recusar e-mail inexistente (401)', async () => {
    const res = await request(app).post('/api/users/login').send({
      email: `naoexiste_${Date.now()}@x.com`,
      password: '1234',
    });
    expect(res.status).toBe(401);
  });

  // ---------------- Categorias ----------------
  it('Categoria: deve recusar criação sem campos obrigatórios (400)', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ color: '#000' });
    expect(res.status).toBe(400);
  });

  it('Categoria: deve retornar 404 ao atualizar categoria inexistente', async () => {
    const res = await request(app)
      .put('/api/categories/99999999')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'X', type: 'EXPENSE' });
    expect(res.status).toBe(404);
  });

  it('Categoria: deve bloquear exclusão de categoria padrão do sistema (403)', async () => {
    const res = await request(app)
      .delete(`/api/categories/${categoriaPadraoId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  // ---------------- Metas ----------------
  it('Meta: deve recusar criação sem campos obrigatórios (400)', async () => {
    const res = await request(app)
      .post('/api/goals')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Incompleta' });
    expect(res.status).toBe(400);
  });

  it('Meta: deve retornar 404 ao atualizar meta inexistente', async () => {
    const res = await request(app)
      .put('/api/goals/99999999')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentAmount: 100 });
    expect(res.status).toBe(404);
  });

  it('Meta: deve retornar 404 ao excluir meta inexistente', async () => {
    const res = await request(app)
      .delete('/api/goals/99999999')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  // ---------------- Transações ----------------
  it('Transação: deve recusar criação sem campos obrigatórios (400)', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({ description: 'Sem valor' });
    expect(res.status).toBe(400);
  });
});
