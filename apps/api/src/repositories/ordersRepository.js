import { db } from "../database/connection.js";

export const ordersRepository = {
  listByRestaurant(restaurantId) {
    return db
      .prepare(
        `
          SELECT * FROM orders
          WHERE restaurant_id = ?
            AND deleted_at IS NULL
            AND (
              status NOT IN ('ENTREGUE', 'CANCELADO')
              OR COALESCE(delivered_at, canceled_at, created_at) >= datetime('now', '-7 days')
            )
          ORDER BY created_at DESC
        `
      )
      .all(restaurantId);
  },

  findActiveDuplicate({ restaurantId, orderNumber, platform }) {
    return db
      .prepare(
        `
          SELECT id FROM orders
          WHERE restaurant_id = ? AND order_number = ? AND platform = ?
            AND deleted_at IS NULL
            AND status IN ('EM_PREPARO', 'PRONTO')
        `
      )
      .get(restaurantId, orderNumber, platform);
  },

  findByIdForRestaurant(id, restaurantId) {
    return db
      .prepare(
        "SELECT * FROM orders WHERE id = ? AND restaurant_id = ? AND deleted_at IS NULL"
      )
      .get(id, restaurantId);
  },

  create(order) {
    db.prepare(
      `
        INSERT INTO orders
          (id, restaurant_id, order_number, platform, status, created_at, updated_at, ready_at, note)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
    ).run(
      order.id,
      order.restaurantId,
      order.orderNumber,
      order.platform,
      order.status,
      order.createdAt,
      order.createdAt,
      order.readyAt,
      order.note
    );
  },

  updateStatus({ id, restaurantId, status, timestamp }) {
    db.prepare(
      `
        UPDATE orders
        SET status = ?,
            updated_at = ?,
            ready_at = CASE WHEN ? = 'PRONTO' THEN ? ELSE ready_at END,
            delivered_at = CASE WHEN ? = 'ENTREGUE' THEN ? ELSE delivered_at END,
            canceled_at = CASE WHEN ? = 'CANCELADO' THEN ? ELSE canceled_at END
        WHERE id = ? AND restaurant_id = ? AND deleted_at IS NULL
      `
    ).run(
      status,
      timestamp,
      status,
      timestamp,
      status,
      timestamp,
      status,
      timestamp,
      id,
      restaurantId
    );
  },

  deleteFinalized(restaurantId, timestamp) {
    db.prepare(
      `
        UPDATE orders
        SET deleted_at = ?, updated_at = ?
        WHERE restaurant_id = ?
          AND deleted_at IS NULL
          AND status IN ('ENTREGUE', 'CANCELADO')
      `
    ).run(timestamp, timestamp, restaurantId);
  },

  countAll() {
    return db.prepare("SELECT COUNT(*) AS total FROM orders").get().total;
  },

  countToday() {
    return db
      .prepare(
        "SELECT COUNT(*) AS total FROM orders WHERE date(created_at) = date('now')"
      )
      .get().total;
  }
};
