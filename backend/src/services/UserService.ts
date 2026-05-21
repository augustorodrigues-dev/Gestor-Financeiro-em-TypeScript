import { prisma } from '../prisma';
import bcrypt from 'bcrypt';

interface CreateUserDTO {
  name: string;
  email: string;
  password: string; // O DTO continua recebendo 'password' do front-end
}

export class UserService {
  async createUser(data: CreateUserDTO) {
    // 1. Verifica se o e-mail já está em uso
    const emailJaExiste = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (emailJaExiste) {
      throw new Error("Este e-mail já está cadastrado no sistema.");
    }

    // 2. Encripta a senha com bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);

    // 3. Salva no banco usando 'passwordHash' (o nome correto do seu schema!)
    const novoUsuario = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: hashedPassword, // Alterado de password para passwordHash
      }
    });

    // Remove o hash de senha do objeto de retorno por segurança antes de mandar pro front
    const { passwordHash, ...usuarioSemSenha } = novoUsuario;
    return usuarioSemSenha;
  }
}