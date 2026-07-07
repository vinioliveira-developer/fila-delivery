import { db } from "../database/connection.js";

export const plansRepository = {
  listAll() {
    return db
      .prepare(
        `
          SELECT *
          FROM plans
          WHERE deleted_at IS NULL
          ORDER BY sort_order ASC
        `
      )
      .all();
  },

  findById(id) {
    return db
      .prepare(
        `
          SELECT *
          FROM plans
          WHERE id = ?
            AND deleted_at IS NULL
        `
      )
      .get(id);
  },

  listFeatures(planId) {
    return db
      .prepare(
        `
          SELECT pf.id,
                 pf.plan_id AS planId,
                 pf.feature_id AS featureId,
                 ff.feature_key AS featureKey,
                 ff.name,
                 ff.description,
                 pf.enabled,
                 pf.limit_value AS limitValue
          FROM plan_features pf
          JOIN feature_flags ff ON ff.id = pf.feature_id
          WHERE pf.plan_id = ?
            AND ff.deleted_at IS NULL
          ORDER BY ff.feature_key ASC
        `
      )
      .all(planId);
  }
};
