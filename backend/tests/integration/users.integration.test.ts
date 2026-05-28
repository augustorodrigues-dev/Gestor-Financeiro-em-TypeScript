import request from 'supertest';
import { app } from '../../src/server';
import { prisma } from '../../src/prisma';

describe('Integração: CRUD de Usuários e Acessos', () => {
  let usuarioCriadoId: number;

  const emailDinamico = `admin_${Date.now()}@financeflow.com`;

  it('1. Deve criar uma nova conta com privilégios administrativos (TC-USR-01)', async () => {
    const novoAdmin = {
      name: 'Novo Admin',
      email: emailDinamico,
      password: '1234',
      role: 'ADMIN',
    };

    const response = await request(app)
      .post('/api/users/register')
      .send(novoAdmin);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toHaveProperty('id');
    expect(response.body.user.role).toBe('ADMIN');

    usuarioCriadoId = response.body.user.id;
  });

  it('2. Deve bloquear cadastro de usuários já existentes (TC-USR-02)', async () => {
    const usuarioDuplicado = {
      name: 'Clone',
      email: emailDinamico,
      password: 'senha',
    };

    const response = await request(app)
      .post('/api/users/register')
      .send(usuarioDuplicado);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  it('3. Deve realizar login e retornar um token JWT (TC-USR-03 / UC01)', async () => {
    const response = await request(app)
      .post('/api/users/login')
      .send({ email: emailDinamico, password: '1234' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body.user).toHaveProperty('role', 'ADMIN');
  });

  it('4. Deve barrar login com senha incorreta (401)', async () => {
    const response = await request(app)
      .post('/api/users/login')
      .send({ email: emailDinamico, password: 'errada' });

    expect(response.status).toBe(401);
  });

  it('5. Deve listar a tabela de gestão com os níveis de acesso (TC-USR-04)', async () => {
    const response = await request(app).get('/api/users');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('6. Deve atualizar o nome e o nível de um usuário (TC-USR-05)', async () => {
    expect(usuarioCriadoId).toBeDefined();

    const response = await request(app)
      .put(`/api/users/${usuarioCriadoId}`)
      .send({ name: 'Nome Atualizado', role: 'ADMIN' });

    expect(response.status).toBe(200);
  });

  it('7. Deve validar a exclusão física do usuário em cascata (TC-USR-06)', async () => {
    expect(usuarioCriadoId).toBeDefined();

    const response = await request(app).delete(`/api/users/${usuarioCriadoId}`);

    expect(response.status).toBe(200);
    usuarioCriadoId = 0;
  });

  afterAll(async () => {
    if (usuarioCriadoId) {
      await request(app).delete(`/api/users/${usuarioCriadoId}`);
    }
    await prisma.$disconnect();
  });
});
