import { db } from "../database/connection.js";

export const usersRepository = {
  findByEmail(email) {
    return db
      .prepare(
        `
          SELECT users.*, restaurants.name AS restaurant_name,
                 restaurants.logo AS restaurant_logo,
                 restaurants.status AS restaurant_status,
                 restaurants.expires_at
          FROM users
          LEFT JOIN restaurants ON restaurants.id = users.restaurant_id
          WHERE users.email = ?
            AND users.deleted_at IS NULL
        `
      )
      .get(email);
  },

  findById(id) {
    return db
      .prepare("SELECT * FROM users WHERE id = ? AND deleted_at IS NULL")
      .get(id);
  },

  findActiveById(id) {
    return db
      .prepare(
        `
          SELECT users.*, restaurants.status AS restaurant_status,
                 restaurants.expires_at AS restaurant_expires_at
          FROM users
          LEFT JOIN restaurants ON restaurants.id = users.restaurant_id
          WHERE users.id = ?
            AND users.active = 1
            AND users.deleted_at IS NULL
            AND (restaurants.deleted_at IS NULL OR users.restaurant_id IS NULL)
        `
      )
      .get(id);
  },

  createClientUser({ id, restaurantId, name, email, password, createdAt }) {
    db.prepare(
      `
        INSERT INTO users
          (id, restaurant_id, name, email, password, role, active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 'CLIENT', 1, ?, ?)
      `
    ).run(id, restaurantId, name, email, password, createdAt, createdAt);
  },

  findByRestaurantId(restaurantId) {
    return db
      .prepare(
        `
          SELECT *
          FROM users
          WHERE restaurant_id = ?
            AND role = 'CLIENT'
            AND deleted_at IS NULL
          ORDER BY created_at DESC
          LIMIT 1
        `
      )
      .get(restaurantId);
  },

  updateClientUserByRestaurantId({ restaurantId, name, email, active, updatedAt, deletedAt, deletedBy }) {
    const fields = [];
    const values = [];

    if (typeof name === "string") {
      fields.push("name = ?");
      values.push(name);
    }

    if (typeof email === "string") {
      fields.push("email = ?");
      values.push(email);
    }

    if (typeof active === "boolean") {
      fields.push("active = ?");
      values.push(active ? 1 : 0);
    }

    if (updatedAt) {
      fields.push("updated_at = ?");
      values.push(updatedAt);
    }

    if (deletedAt) {
      fields.push("deleted_at = ?");
      values.push(deletedAt);
    }

    if (deletedBy) {
      fields.push("deleted_by = ?");
      values.push(deletedBy);
    }

    if (fields.length === 0) {
      return;
    }

    values.push(restaurantId);

    db.prepare(
      `
        UPDATE users
        SET ${fields.join(", ")}
        WHERE restaurant_id = ?
          AND role = 'CLIENT'
      `
    ).run(...values);
  },

  listAll() {
    return db
      .prepare(
        `
          SELECT users.id, users.name, users.email, users.role, users.active,
                 restaurants.name AS restaurantName
          FROM users
          LEFT JOIN restaurants ON restaurants.id = users.restaurant_id
          WHERE users.deleted_at IS NULL
            AND (
              users.role = 'ADMIN'
              OR (
                users.role = 'CLIENT'
                AND users.active = 1
                AND users.restaurant_id IS NOT NULL
                AND restaurants.deleted_at IS NULL
                AND restaurants.status = 'Ativo'
              )
            )
          ORDER BY users.created_at DESC
        `
      )
      .all();
  },

  updatePassword(id, password, updatedAt) {
    db.prepare("UPDATE users SET password = ?, updated_at = ? WHERE id = ?").run(
      password,
      updatedAt,
      id
    );
  }
};
