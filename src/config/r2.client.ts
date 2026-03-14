import { S3Client } from "@aws-sdk/client-s3";
import { envs } from "./envs";

export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${envs.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: envs.R2_ACCESS_KEY_ID,
    secretAccessKey: envs.R2_SECRET_ACCESS_KEY,
  },
});
