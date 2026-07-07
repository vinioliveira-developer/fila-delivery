import { now } from "../../utils/date.js";

const featureFlags = [
  ["feature_orders", "orders.enabled", "Pedidos", "Fluxo operacional de pedidos.", "OPERATIONS"],
  ["feature_tvs", "tv.enabled", "TVs", "Telas de pedidos em preparo e prontos.", "OPERATIONS"],
  ["feature_history", "history.enabled", "Historico", "Historico operacional de pedidos.", "OPERATIONS"],
  ["feature_dashboard", "dashboard.enabled", "Dashboard", "Indicadores operacionais do restaurante.", "ANALYTICS"],
  ["feature_reports", "reports.enabled", "Relatorios", "Relatorios gerenciais futuros.", "ANALYTICS"],
  ["feature_audit", "audit.enabled", "Auditoria", "Rastreio de acoes importantes.", "SECURITY"],
  ["feature_multi_unit", "multi_unit.enabled", "Multi-lojas", "Controle de mais de uma unidade.", "GROWTH"],
  ["feature_api", "api.enabled", "API", "Acesso a API e integracoes futuras.", "INTEGRATIONS"]
];

const planFeatures = {
  plan_starter: [
    "feature_orders",
    "feature_tvs",
    "feature_history",
    "feature_dashboard",
    "feature_reports",
    "feature_audit",
    "feature_multi_unit",
    "feature_api"
  ],
  plan_pro: [
    "feature_orders",
    "feature_tvs",
    "feature_history",
    "feature_dashboard",
    "feature_reports",
    "feature_audit",
    "feature_multi_unit",
    "feature_api"
  ],
  plan_premium: [
    "feature_orders",
    "feature_tvs",
    "feature_history",
    "feature_dashboard",
    "feature_reports",
    "feature_audit",
    "feature_multi_unit",
    "feature_api"
  ]
};

export function seedFeatureFlags(db) {
  const timestamp = now();

  featureFlags.forEach(([id, featureKey, name, description, category]) => {
    const existing = db.prepare("SELECT id FROM feature_flags WHERE id = ?").get(id);

    if (!existing) {
      db.prepare(
        `
          INSERT INTO feature_flags
            (id, feature_key, name, description, category, enabled_by_default,
             status, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, 0, 'ACTIVE', ?, ?)
        `
      ).run(id, featureKey, name, description, category, timestamp, timestamp);
    }
  });

  Object.entries(planFeatures).forEach(([planId, features]) => {
    features.forEach((featureId) => {
      const id = `${planId}_${featureId}`;
      const existing = db.prepare("SELECT id FROM plan_features WHERE id = ?").get(id);

      if (existing) {
        db.prepare(
          `
            UPDATE plan_features
               SET enabled = 1,
                   updated_at = ?
             WHERE id = ?
          `
        ).run(timestamp, id);

        return;
      }

      db.prepare(
        `
          INSERT INTO plan_features
            (id, plan_id, feature_id, enabled, created_at, updated_at)
          VALUES (?, ?, ?, 1, ?, ?)
        `
      ).run(id, planId, featureId, timestamp, timestamp);
    });
  });
}
