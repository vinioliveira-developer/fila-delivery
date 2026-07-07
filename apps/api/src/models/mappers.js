export function rowToOrder(row) {
  return {
    id: row.id,
    restaurantId: row.restaurant_id,
    number: row.order_number,
    platform: row.platform,
    status: row.status,
    createdAt: row.created_at,
    readyAt: row.ready_at ?? undefined,
    deliveredAt: row.delivered_at ?? undefined,
    canceledAt: row.canceled_at ?? undefined,
    note: row.note ?? undefined
  };
}

export function rowToRestaurant(row) {
  return {
    id: row.id,
    name: row.name,
    cnpj: row.cnpj ?? "",
    phone: row.phone ?? "",
    email: row.email ?? "",
    logo: row.logo ?? "",
    planId: row.plan_id ?? undefined,
    plan: row.plan_name ?? row.plan,
    status: row.status,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function rowToPlanFeature(row) {
  return {
    id: row.id,
    planId: row.planId,
    featureId: row.featureId,
    featureKey: row.featureKey,
    name: row.name,
    description: row.description ?? undefined,
    enabled: Boolean(row.enabled),
    limitValue: row.limitValue ?? undefined
  };
}

export function rowToPlan(row) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? undefined,
    priceCents: row.price_cents,
    billingCycle: row.billing_cycle,
    userLimit: row.user_limit ?? undefined,
    historyDays: row.history_days,
    restaurantLimit: row.restaurant_limit,
    status: row.status,
    sortOrder: row.sort_order,
    features: row.features ?? []
  };
}

export function rowToPublicUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    active: Boolean(row.active),
    restaurantName: row.restaurantName ?? undefined
  };
}
