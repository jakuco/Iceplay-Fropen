import { S3Client } from "@aws-sdk/client-s3";
import { envs } from "./envs";

function createR2Client(): S3Client {
  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY } = envs;

  // Revisar si las variables están ausentes o son "None"
  const invalid = [R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY].some(
    (v) => !v || v === "None"
  );

  if (invalid) {
    console.warn(
      "[R2] Env variables missing or set to 'None'. Instantiating dummy client."
    );

    return new S3Client({
      region: "auto",
      endpoint: "https://example.invalid", // endpoint ficticio
      credentials: {
        accessKeyId: "dummy",
        secretAccessKey: "dummy",
      },
    });
  }

  // Cliente real
  return new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });
}

export const r2Client = createR2Client();