import 'dotenv/config';
import { get } from 'env-var';


export const envs = {

  PORT: get('PORT').required().asPortNumber(),
  JWT_SECRET: get('JWT_SECRET').required().asString(),
  MAILER_SERVICE: get('MAILER_SERVICE').required().asString(),
  MAILER_EMAIL:get('MAILER_EMAIL').required().asString(),
  MAILER_SECRET_KEY:get('MAILER_SECRET_KEY').required().asString(),
  WEB_SERVICE_URL:get('WEB_SERVICE_URL').required().asString(),
  SEND_EMAIL:get('SEND_EMAIL').required().default('false').asBool(),
  JWT_TOKEN:get('JWT_TOKEN').required().asString(),
  API_URL:get('API_URL').required().asString(),
  CORS_ORIGIN:get('CORS_ORIGIN').default('http://localhost:4200').asString(),

  // PostgreSQL
  DB_HOST: get('DB_HOST').default('localhost').asString(),
  DB_PORT: get('DB_PORT').default('5432').asPortNumber(),
  DB_USER: get('DB_USER').default('postgres').asString(),
  DB_PASSWORD: get('DB_PASSWORD').default('').asString(),
  DB_NAME: get('DB_NAME').default('iceplay').asString(),

  // Cloudflare R2
  R2_ACCOUNT_ID: get('R2_ACCOUNT_ID').required().asString(),
  R2_ACCESS_KEY_ID: get('R2_ACCESS_KEY_ID').required().asString(),
  R2_SECRET_ACCESS_KEY: get('R2_SECRET_ACCESS_KEY').required().asString(),
  R2_BUCKET_NAME: get('R2_BUCKET_NAME').required().asString(),

  MAX_FILE_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB ?? '50', 10),
}



