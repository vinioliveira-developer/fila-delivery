import { db } from "../database/connection.js";

export const restaurantsRepository = {
  findById(id) {
    return db
      .prepare(
        `
          SELECT r.*, p.name AS plan_name
          FROM restaurants r
          LEFT JOIN plans p ON p.id = r.plan_id
          WHERE r.id = ?
            AND r.deleted_at IS NULL
        `
      )
      .get(id);
  },

  listAll() {
    return db
      .prepare(
        `
          SELECT r.*, p.name AS plan_name
          FROM restaurants r
          LEFT JOIN plans p ON p.id = r.plan_id
          WHERE r.deleted_at IS NULL
          ORDER BY r.created_at DESC
        `
      )
      .all();
  },

  create(restaurant) {
    db.prepare(
      `
        INSERT INTO restaurants
          (id, name, cnpj, phone, email, logo, plan, plan_id, status, expires_at, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
    ).run(
      restaurant.id,
      restaurant.name,
      restaurant.cnpj,
      restaurant.phone,
      restaurant.email,
      restaurant.logo,
      restaurant.plan,
      restaurant.planId,
      restaurant.status,
      restaurant.expiresAt,
      restaurant.createdAt,
      restaurant.updatedAt
    );
  },

  update(id, restaurant) {
    db.prepare(
      `
        UPDATE restaurants
        SET name = ?, cnpj = ?, phone = ?, email = ?, logo = ?, plan = ?,
            plan_id = ?, status = ?, expires_at = ?, updated_at = ?
        WHERE id = ?
          AND deleted_at IS NULL
      `
    ).run(
      restaurant.name,
      restaurant.cnpj,
      restaurant.phone,
      restaurant.email,
      restaurant.logo,
      restaurant.plan,
      restaurant.planId,
      restaurant.status,
      restaurant.expiresAt,
      restaurant.updatedAt,
      id
    );
  },

  delete(id, deletedAt) {
    db.prepare(
      `
        UPDATE restaurants
        SET deleted_at = ?, updated_at = ?
        WHERE id = ?
          AND deleted_at IS NULL
      `
    ).run(deletedAt, deletedAt, id);
  }
};
