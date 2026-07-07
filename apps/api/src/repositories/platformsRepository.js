import { db } from "../database/connection.js";

export const platformsRepository = {
  listNamesByRestaurant(restaurantId) {
    return db
      .prepare(
        "SELECT name FROM platforms WHERE restaurant_id = ? AND deleted_at IS NULL ORDER BY created_at ASC"
      )
      .all(restaurantId)
      .map((row) => row.name);
  },

  create({ id, restaurantId, name, createdAt }) {
    const deletedPlatform = db
      .prepare(
        "SELECT id FROM platforms WHERE restaurant_id = ? AND name = ? AND deleted_at IS NOT NULL"
      )
      .get(restaurantId, name);

    if (deletedPlatform) {
      db.prepare(
        "UPDATE platforms SET deleted_at = NULL, deleted_by = NULL, updated_at = ? WHERE id = ?"
      ).run(createdAt, deletedPlatform.id);
      return;
    }

    db.prepare(
      "INSERT INTO platforms (id, restaurant_id, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?)"
    ).run(id, restaurantId, name, createdAt, createdAt);
  },

  deleteByName(restaurantId, name, timestamp) {
    db.prepare(
      `
        UPDATE platforms
        SET deleted_at = ?, updated_at = ?
        WHERE restaurant_id = ? AND name = ? AND deleted_at IS NULL
      `
    ).run(timestamp, timestamp, restaurantId, name);
  }
};
