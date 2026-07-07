import { now } from "../../utils/date.js";

const plans = [
  {
    id: "plan_starter",
    name: "Plano Trimestral",
    slug: "trimestral",
    description: "Ideal para restaurantes que desejam iniciar utilizando o Fila Delivery com um contrato de curto prazo.",
    priceCents: 21000 ,
    billingCycle: "QUARTERLY",
    userLimit: null,
    historyDays: 365,
    restaurantLimit: 1,
    sortOrder: 1
  },
  {
    id: "plan_pro",
    name: "Plano Semestral",
    slug: "semestral",
    description: "Ideal para restaurantes que desejam reduzir o custo mensal através de um contrato de maior duração.",
    priceCents: 40000,
    billingCycle: "SEMIANNUAL",
    userLimit: null,
    historyDays: 365,
    restaurantLimit: 1,
    sortOrder: 2
  },
  {
    id: "plan_premium",
    name: "Plano Anual",
    slug: "anual",
    description: "Melhor custo-benefício para restaurantes que desejam utilizar o sistema durante todo o ano.",
    priceCents: 80000,
    billingCycle: "ANNUAL",
    userLimit: null,
    historyDays: 365,
    restaurantLimit: 1,
    sortOrder: 3
  }
];

export function seedPlans(db) {
  const timestamp = now();

  plans.forEach((plan) => {
    const existing = db.prepare("SELECT id FROM plans WHERE id = ?").get(plan.id);

    if (existing) {
      db.prepare(
        `
          UPDATE plans
             SET name = ?,
                 slug = ?,
                 description = ?,
                 price_cents = ?,
                 billing_cycle = ?,
                 user_limit = ?,
                 history_days = ?,
                 restaurant_limit = ?,
                 sort_order = ?,
                 updated_at = ?
           WHERE id = ?
        `
      ).run(
        plan.name,
        plan.slug,
        plan.description,
        plan.priceCents,
        plan.billingCycle,
        plan.userLimit,
        plan.historyDays,
        plan.restaurantLimit,
        plan.sortOrder,
        timestamp,
        plan.id
      );

      return;
    }

    db.prepare(
      `
        INSERT INTO plans
          (id, name, slug, description, price_cents, billing_cycle, user_limit,
           history_days, restaurant_limit, status, sort_order, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?, ?, ?)
      `
    ).run(
      plan.id,
      plan.name,
      plan.slug,
      plan.description,
      plan.priceCents,
      plan.billingCycle,
      plan.userLimit,
      plan.historyDays,
      plan.restaurantLimit,
      plan.sortOrder,
      timestamp,
      timestamp
    );
  });
}
