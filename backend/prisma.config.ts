import { defineConfig } from '@prisma/config';
import 'dotenv/config'; 

declare var process: {
  env: {
    [key: string]: string | undefined;
  };
};

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL as string,
  },
  migrations: {
    seed: 'ts-node ./src/seed.ts',
  }
});