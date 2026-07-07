import { db } from "../database/connection.js";

export const auditLogsRepository = {
  create(log) {
    db.prepare(
      `
        INSERT INTO audit_logs
          (id, restaurant_id, user_id, action, entity, entity_id, before_data,
           after_data, ip_address, user_agent, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
    ).run(
      log.id,
      log.restaurantId,
      log.userId,
      log.action,
      log.entity,
      log.entityId,
      log.beforeData,
      log.afterData,
      log.ipAddress,
      log.userAgent,
      log.createdAt
    );
  }
};
