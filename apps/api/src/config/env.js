import { config } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../../../../.env") });

export const env = {
  appName: process.env.APP_NAME ?? "Fila Delivery",
  appVersion: process.env.APP_VERSION ?? "0.1.0",
  apiPort: Number(process.env.PORT ?? 3333),
  allowedOrigin: process.env.CORS_ORIGIN ?? "*",
  backupDir: process.env.BACKUP_DIR ?? "backups",
  buildDate: process.env.BUILD_DATE ?? null,
  buildSha: process.env.BUILD_SHA ?? "local",
  databasePath: process.env.DATABASE_PATH ?? "data/fila-delivery.sqlite",
  environment: process.env.NODE_ENV ?? "development",
  isProduction: process.env.NODE_ENV === "production",
  loginRateLimitMaxAttempts: Number(process.env.LOGIN_RATE_LIMIT_MAX_ATTEMPTS ?? 5),
  loginRateLimitWindowMs: Number(process.env.LOGIN_RATE_LIMIT_WINDOW_MS ?? 15 * 60 * 1000),
  seedAdminEmail: process.env.SEED_ADMIN_EMAIL ?? "admin@example.com",
  seedAdminName: process.env.SEED_ADMIN_NAME ?? "Administrador Exemplo",
  seedAdminPassword: process.env.SEED_ADMIN_PASSWORD,
  tokenSecretProvided: Boolean(process.env.FILA_DELIVERY_TOKEN_SECRET),
  tokenSecret: process.env.FILA_DELIVERY_TOKEN_SECRET
};

export function validateEnv() {
  if (!env.tokenSecretProvided) {
    throw new Error(
      "FILA_DELIVERY_TOKEN_SECRET e obrigatorio. Defina uma chave segura antes de iniciar a API."
    );
  }
}
