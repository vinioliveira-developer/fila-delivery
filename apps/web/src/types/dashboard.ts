export type AdminStats = {
  activeClients: number;
  blockedClients: number;
  expiringPlans: number;
  expiredPlans?: number;
  registeredUsers?: number;
  todayOrders?: number;
  monthlyRevenue: number;
  processedOrders: number;
};
