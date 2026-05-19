import { defineConfig } from '@prisma/config';
import 'dotenv/config'; // Força o carregamento do arquivo .env

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL as string, // O "as string" resolve o erro amarelo
  }
});