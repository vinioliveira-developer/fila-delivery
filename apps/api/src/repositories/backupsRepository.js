import { db } from "../database/connection.js";

export const backupsRepository = {
  create(backup) {
    db.prepare(
      `
        INSERT INTO backups
          (id, status, storage_provider, storage_key, file_size_bytes, checksum,
           started_at, finished_at, error_message)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
    ).run(
      backup.id,
      backup.status,
      backup.storageProvider,
      backup.storageKey,
      backup.fileSizeBytes,
      backup.checksum,
      backup.startedAt,
      backup.finishedAt,
      backup.errorMessage
    );
  }
};
