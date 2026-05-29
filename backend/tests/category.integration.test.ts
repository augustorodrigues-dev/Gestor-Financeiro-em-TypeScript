import request from 'supertest';
import { app } from '../src/server';

describe('Integração: API de Categorias', () => {
  let token: string;

  beforeAll(async () => {
    const res = await request(app).post('/api/users/login').send({
      email: 'jadao@gmail.com', password: '1234'
    });
    token = res.body.token;
  });

  it('Deve listar categorias (Padrão + Customizadas)', async () => {
    const res = await request(app)
      .get('/api/categories')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('Deve criar uma categoria personalizada', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Lazer', type: 'EXPENSE', color: '#FF0000' });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Lazer');
  });
});