import 'dotenv/config';
import { get } from 'env-var';


export const envs = {

  PORT: get('PORT').required().asPortNumber(),
  MONGO_URL: get('MONGO_URL').required().asString(),
  MONGO_DB_NAME: get('MONGO_DB_NAME').required().asString(),
  JWT_SECRET: get('JWT_SECRET').required().asString(),
  MAILER_SERVICE: get('MAILER_SERVICE').required().asString(),
  MAILER_EMAIL:get('MAILER_EMAIL').required().asString(),
  MAILER_SECRET_KEY:get('MAILER_SECRET_KEY').required().asString(),
  WEB_SERVICE_URL:get('WEB_SERVICE_URL').required().asString(),
  SEND_EMAIL:get('SEND_EMAIL').required().default('false').asBool(),
  JWT_TOKEN:get('JWT_TOKEN').required().asString(),
  API_URL:get('API_URL').required().asString(),

  // PostgreSQL
  DB_HOST: get('DB_HOST').default('localhost').asString(),
  DB_PORT: get('DB_PORT').default('5432').asPortNumber(),
  DB_USER: get('DB_USER').required().asString(),
  DB_PASSWORD: get('DB_PASSWORD').required().asString(),
  DB_NAME: get('DB_NAME').required().asString(),
}



