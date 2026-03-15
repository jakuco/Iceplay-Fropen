import { envs } from './config/envs';
import { MongoDatabase, DrizzleDatabase} from './data';
import { AppRoutes } from './presentation/routes';
import { Server } from './presentation/server';


let db: any; // instancia base de datos postgreSQL

(async()=> {
  main();
})();


async function main() {

  console.table(envs)

  await MongoDatabase.connect({
    dbName: envs.MONGO_DB_NAME,
    mongoUrl: envs.MONGO_URL
  });

  // Conectar a PostgreSQL con Drizzle
  db = await DrizzleDatabase.connect({
    host: envs.DB_HOST,
    port: envs.DB_PORT,
    user: envs.DB_USER,
    password: envs.DB_PASSWORD,
    database: envs.DB_NAME,
  });

  const server = new Server({
    port: envs.PORT,
    routes: AppRoutes.routes,
  });

  server.start();
}