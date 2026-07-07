import { db } from "../database/connection.js";

export const passwordResetsRepository = {
  create(reset) {
    db.prepare(
      `
        INSERT INTO password_resets
          (id, user_id, token_hash, requested_ip, requested_user_agent,
           used, created_at, expires_at)
        VALUES (?, ?, ?, ?, ?, 0, ?, ?)
      `
    ).run(
      reset.id,
      reset.userId,
      reset.tokenHash,
      reset.requestedIp,
      reset.requestedUserAgent,
      reset.createdAt,
      reset.expiresAt
    );
  },

  findValidByTokenHash(tokenHash) {
    return db
      .prepare(
        `
          SELECT * FROM password_resets
          WHERE token_hash = ? AND used = 0
        `
      )
      .get(tokenHash);
  },

  expireExpired(timestamp) {
    db.prepare(
      "UPDATE password_resets SET used = 1, used_at = ? WHERE used = 0 AND expires_at < ?"
    ).run(timestamp, timestamp);
  },

  markUsed(id, timestamp) {
    db.prepare("UPDATE password_resets SET used = 1, used_at = ? WHERE id = ?").run(
      timestamp,
      id
    );
  },

  invalidateUserTokens(userId, timestamp) {
    db.prepare(
      "UPDATE password_resets SET used = 1, used_at = ? WHERE user_id = ? AND used = 0"
    ).run(timestamp, userId);
  }
};
