import request from 'supertest';
import { app } from '../src/server';
import { prisma } from '../src/prisma';

describe('Integração: CRUD de Usuários e Acessos', () => {
  let usuarioCriadoId: number;
  
  const emailDinamico = `admin_${Date.now()}@financeflow.com`;

  it('1. Deve criar uma nova conta com privilégios administrativos (TC-USR-01)', async () => {
    const novoAdmin = {
      name: 'Novo Admin',
      email: emailDinamico, 
      password: '1234',
      role: 'ADMIN'
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
      name: 'Clone da Alexandra',
      email: 'alexandra@gmail.com', 
      password: 'senha'
    };

    const response = await request(app)
      .post('/api/users/register')
      .send(usuarioDuplicado);

    expect(response.status).toBe(400); 
    expect(response.body).toHaveProperty('error');
  });

  it('3. Deve listar a tabela de gestão com os níveis de acesso (TC-USR-03)', async () => {
    const response = await request(app).get('/api/users');
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true); 
  });

  it('4. Deve atualizar o nome e a promoção de nível de um usuário (TC-USR-04)', async () => {
    expect(usuarioCriadoId).toBeDefined();
    expect(usuarioCriadoId).not.toBeNull();

    const dadosAtualizados = {
      name: 'Nome Atualizado',
      role: 'ADMIN'
    };

    const response = await request(app)
      .put(`/api/users/${usuarioCriadoId}`)
      .send(dadosAtualizados);

    expect(response.status).toBe(200);
  });

  it('5. Deve validar a exclusão física do usuário em cascata (TC-USR-05)', async () => {
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