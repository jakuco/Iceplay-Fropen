import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./modelos/schema";
import { initDb } from "./db";

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
      const pool = new Pool({ host, port, user, password, database });
      await pool.query("SELECT NOW()");
      console.log("✅ Connected to PostgreSQL with Drizzle");

      const db = drizzle(pool, { schema });
      initDb(db);
      return db;
    } catch (error) {
      console.error("❌ PostgreSQL connection error:", error);
      throw error;
    }
  }
}