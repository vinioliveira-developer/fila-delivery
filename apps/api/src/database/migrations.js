import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { db } from "./connection.js";

const currentDir = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(currentDir, "migrations");

function ensureMigrationTable() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      filename TEXT NOT NULL UNIQUE,
      applied_at TEXT NOT NULL
    );
  `);
}

function appliedMigrations() {
  return new Set(
    db
      .prepare("SELECT filename FROM schema_migrations ORDER BY filename ASC")
      .all()
      .map((row) => row.filename)
  );
}

function runMigration(filename) {
  const migration = readFileSync(join(migrationsDir, filename), "utf8");

  db.exec("BEGIN");

  try {
    db.exec(migration);
    db.prepare(
      "INSERT INTO schema_migrations (id, filename, applied_at) VALUES (?, ?, ?)"
    ).run(filename.replace(".sql", ""), filename, new Date().toISOString());
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

export function migrate() {
  ensureMigrationTable();

  const applied = appliedMigrations();
  const files = readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  files.forEach((file) => {
    if (!applied.has(file)) {
      runMigration(file);
    }
  });
}
