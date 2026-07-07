import { randomUUID } from "node:crypto";
import { env } from "../../config/env.js";
import { hashPassword } from "../../utils/password.js";
import { now } from "../../utils/date.js";

export function seedAdmin(db) {
  const seedPassword = env.seedAdminPassword ?? (env.isProduction ? null : "admin123");

  if (!seedPassword) {
    return;
  }

  const existing = db
    .prepare("SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1")
    .get();

  if (existing) {
    return;
  }

  const timestamp = now();

  db.prepare(
    `
      INSERT INTO users
        (id, restaurant_id, name, email, password, role, active, created_at, updated_at)
      VALUES (?, NULL, ?, ?, ?, 'ADMIN', 1, ?, ?)
    `
  ).run(
    randomUUID(),
    env.seedAdminName,
    env.seedAdminEmail,
    hashPassword(seedPassword),
    timestamp,
    timestamp
  );
}
