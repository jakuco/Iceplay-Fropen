import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './modelos/schema';

interface Options {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

export class DrizzleDatabase {
  static async connect(options: Options) {
    const { host, port, user, password, database } = options;

    try {
      const pool = new Pool({
        host,
        port,
        user,
        password,
        database,
      });

      await pool.query('SELECT NOW()'); // Verifica la conexión
      console.log('✅ Connected to PostgreSQL with Drizzle');

      return drizzle(pool, { schema });
    } catch (error) {
      console.error('❌ PostgreSQL connection error:', error);
      throw error;
    }
  }
}