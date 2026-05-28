import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Estendendo a tipagem do Express para aceitar o req.user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // 1. Pega o token do cabeçalho de autorização
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido. Acesso negado.' });
  }

  // 2. Separa o "Bearer" do token em si
  const [, token] = authHeader.split(' ');

  try {
    // 3. Tenta descriptografar o token usando a sua chave secreta
    // (Certifique-se de ter um JWT_SECRET no seu arquivo .env)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_padrao_aqui');
    
    // 4. Injeta os dados do usuário (como o ID) dentro da requisição
    req.user = decoded;
    
    // 5. Libera a catraca para o Controller continuar o trabalho
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
};