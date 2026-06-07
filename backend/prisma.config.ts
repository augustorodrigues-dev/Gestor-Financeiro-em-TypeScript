import { defineConfig } from '@prisma/config';
import 'dotenv/config';

declare var process: {
  env: {
    [key: string]: string | undefined;
  };
};

export default defineConfig({
  // No Prisma 7, a URL de conexão usada pelo Migrate fica aqui (e não no schema).
  // Aponta para o arquivo SQLite local (DATABASE_URL = file:./dev.db).
  datasource: {
    url: process.env.DATABASE_URL as string,
  },
  migrations: {
    seed: 'ts-node ./src/seed.ts',
  },
});
