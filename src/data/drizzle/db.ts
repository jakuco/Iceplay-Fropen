import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./models/schema";

type DrizzleDb = ReturnType<typeof drizzle<typeof schema>>;

let _db: DrizzleDb | null = null;

export function initDb(db: DrizzleDb) {
  _db = db;
}

export function getDb(): DrizzleDb {
  if (!_db) throw new Error("Database not initialized. Call initDb() first.");
  return _db;
}

export type { DrizzleDb };
