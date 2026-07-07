import { createHash, randomUUID } from "node:crypto";
import { copyFileSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { basename, resolve } from "node:path";
import { env } from "../config/env.js";
import { backupsRepository } from "../repositories/backupsRepository.js";
import { now } from "../utils/date.js";
import { logger } from "../utils/logger.js";

function safeTimestamp(value) {
  return value.replace(/[:.]/g, "-");
}

function checksumFile(filePath) {
  return createHash("sha256").update(readFileSync(filePath)).digest("hex");
}

export const backupService = {
  createBackup(metadata = {}) {
    const id = randomUUID();
    const startedAt = now();
    const databasePath = resolve(env.databasePath);
    const backupDir = resolve(env.backupDir);
    const fileName = `fila-delivery-${safeTimestamp(startedAt)}.sqlite`;
    const targetPath = resolve(backupDir, fileName);

    try {
      mkdirSync(backupDir, { recursive: true });
      copyFileSync(databasePath, targetPath);

      const stats = statSync(targetPath);
      const checksum = checksumFile(targetPath);

      backupsRepository.create({
        id,
        status: "COMPLETED",
        storageProvider: "LOCAL",
        storageKey: targetPath,
        fileSizeBytes: stats.size,
        checksum,
        startedAt,
        finishedAt: now(),
        errorMessage: null
      });

      logger.info("backup.completed", {
        backupId: id,
        storageProvider: "LOCAL",
        storageKey: basename(targetPath),
        fileSizeBytes: stats.size,
        ...metadata
      });

      return {
        id,
        status: "COMPLETED",
        storageKey: targetPath,
        fileSizeBytes: stats.size,
        checksum
      };
    } catch (error) {
      backupsRepository.create({
        id,
        status: "FAILED",
        storageProvider: "LOCAL",
        storageKey: targetPath,
        fileSizeBytes: null,
        checksum: null,
        startedAt,
        finishedAt: now(),
        errorMessage: error?.message ?? "Falha ao criar backup."
      });

      logger.error("backup.failed", {
        backupId: id,
        storageProvider: "LOCAL",
        errorMessage: error?.message,
        ...metadata
      });

      throw error;
    }
  }
};
