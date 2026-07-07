import { Order } from "../types/order";
import { getOrderFinalizedAt } from "./date";

export function pruneOldFinishedOrders(orders: Order[]) {
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  return orders.filter((order) => {
    if (order.status !== "ENTREGUE" && order.status !== "CANCELADO") {
      return true;
    }

    return new Date(getOrderFinalizedAt(order)).getTime() >= sevenDaysAgo;
  });
}

export function getUniquePlatforms(orders: Order[]) {
  return Array.from(new Set(orders.map((order) => order.platform)));
}
