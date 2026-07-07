import { env } from "../config/env.js";

const SENSITIVE_KEYS = new Set([
  "authorization",
  "cookie",
  "password",
  "initialPassword",
  "token",
  "resetToken",
  "tokenHash",
  "passwordHash"
]);

function sanitize(value) {
  if (Array.isArray(value)) {
    return value.map(sanitize);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        SENSITIVE_KEYS.has(key) ? "[REDACTED]" : sanitize(item)
      ])
    );
  }

  return value;
}

function write(level, message, metadata = {}) {
  const entry = sanitize({
    timestamp: new Date().toISOString(),
    level,
    message,
    environment: env.environment,
    ...metadata
  });

  process.stdout.write(`${JSON.stringify(entry)}\n`);
}

export const logger = {
  debug(message, metadata) {
    if (!env.isProduction) {
      write("DEBUG", message, metadata);
    }
  },

  info(message, metadata) {
    write("INFO", message, metadata);
  },

  warn(message, metadata) {
    write("WARN", message, metadata);
  },

  error(message, metadata) {
    write("ERROR", message, metadata);
  }
};
