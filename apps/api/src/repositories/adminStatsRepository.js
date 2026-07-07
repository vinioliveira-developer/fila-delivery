import { db } from "../database/connection.js";

export const adminStatsRepository = {
  countActiveRestaurants() {
    return db
      .prepare(
        "SELECT COUNT(*) AS total FROM restaurants WHERE status = 'Ativo' AND deleted_at IS NULL"
      )
      .get().total;
  },

  countBlockedRestaurants() {
    return db
      .prepare(
        "SELECT COUNT(*) AS total FROM restaurants WHERE status != 'Ativo' AND deleted_at IS NULL"
      )
      .get().total;
  },

  countExpiringRestaurants() {
    return db
      .prepare(
        "SELECT COUNT(*) AS total FROM restaurants WHERE deleted_at IS NULL AND expires_at BETWEEN datetime('now') AND datetime('now', '+7 days')"
      )
      .get().total;
  },

  countExpiredRestaurants() {
    return db
      .prepare(
        "SELECT COUNT(*) AS total FROM restaurants WHERE deleted_at IS NULL AND expires_at < datetime('now')"
      )
      .get().total;
  },

  countUsers() {
    return db
      .prepare("SELECT COUNT(*) AS total FROM users WHERE deleted_at IS NULL")
      .get().total;
  }
};
