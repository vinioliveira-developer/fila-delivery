export function now() {
  return new Date().toISOString();
}

export function addMonths(date, months) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next.toISOString();
}

export function planToExpiration(plan, expiresAt) {
  if (expiresAt) {
    return new Date(expiresAt).toISOString();
  }

  const planMonths = {
    Mensal: 1,
    Trimestral: 3,
    Semestral: 6,
    Anual: 12,
    MONTHLY: 1,
    QUARTERLY: 3,
    SEMIANNUAL: 6,
    ANNUAL: 12
  };

  return addMonths(new Date(), planMonths[plan] ?? 1);
}
