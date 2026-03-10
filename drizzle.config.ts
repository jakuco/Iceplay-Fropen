import type { Config } from 'drizzle-kit';
import 'dotenv/config';

export default {
  schema: './src/data/drizzle/modelos/schema.ts',
  out: './src/data/drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || '',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || '',
    ssl: false,
  },
} satisfies Config;