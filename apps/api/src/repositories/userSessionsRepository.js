import { db } from "../database/connection.js";

export const userSessionsRepository = {
  create(session) {
    db.prepare(
      `
        INSERT INTO user_sessions
          (id, user_id, restaurant_id, token_hash, status, ip_address, user_agent,
           browser, created_at, expires_at, last_access_at)
        VALUES (?, ?, ?, ?, 'ACTIVE', ?, ?, ?, ?, ?, ?)
      `
    ).run(
      session.id,
      session.userId,
      session.restaurantId,
      session.tokenHash,
      session.ipAddress,
      session.userAgent,
      session.browser,
      session.createdAt,
      session.expiresAt,
      session.createdAt
    );
  },

  findActiveById(id) {
    return db
      .prepare(
        `
          SELECT * FROM user_sessions
          WHERE id = ? AND status = 'ACTIVE'
        `
      )
      .get(id);
  },

  expireExpired(timestamp) {
    db.prepare(
      `
        UPDATE user_sessions
        SET status = 'EXPIRED', revoked_at = ?
        WHERE status = 'ACTIVE' AND expires_at < ?
      `
    ).run(timestamp, timestamp);
  },

  touch(id, timestamp) {
    db.prepare("UPDATE user_sessions SET last_access_at = ? WHERE id = ?").run(
      timestamp,
      id
    );
  },

  revoke(id, timestamp) {
    db.prepare(
      `
        UPDATE user_sessions
        SET status = 'REVOKED', logged_out_at = ?, revoked_at = ?
        WHERE id = ? AND status = 'ACTIVE'
      `
    ).run(timestamp, timestamp, id);
  },

  revokeActiveByUser(userId, timestamp) {
    db.prepare(
      `
        UPDATE user_sessions
        SET status = 'REVOKED', revoked_at = ?
        WHERE user_id = ? AND status = 'ACTIVE'
      `
    ).run(timestamp, userId);
  },

  expire(id, timestamp) {
    db.prepare(
      "UPDATE user_sessions SET status = 'EXPIRED', revoked_at = ? WHERE id = ? AND status = 'ACTIVE'"
    ).run(timestamp, id);
  }
};
