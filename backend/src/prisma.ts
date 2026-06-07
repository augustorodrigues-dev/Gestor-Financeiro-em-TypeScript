import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'node:path';
import 'dotenv/config';

// Banco LOCAL em arquivo (SQLite), sem Docker e sem servidor.
// O Prisma Migrate (Prisma 7) cria o arquivo em backend/dev.db (relativo à raiz
// do backend). Usamos um caminho absoluto a partir deste arquivo (src/ -> ..)
// para que servidor, testes e seed usem sempre o MESMO arquivo, independentemente
// do diretório de onde o processo é iniciado.
const dbPath = path.resolve(__dirname, '..', 'dev.db');

const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });

export const prisma = new PrismaClient({ adapter });
