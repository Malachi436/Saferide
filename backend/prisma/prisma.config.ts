import { defineConfig } from '@prisma/config';
import { PrismaPostgreSQL } from '@prisma/adapter-pg';

export default defineConfig({
  datasource: {
    adapter: () => new PrismaPostgreSQL(process.env.DATABASE_URL!)
  }
});