import { type CSSProperties } from "react";
import { Order } from "../types/order";
import { getOrderFinalizedAt } from "./date";

const PLATFORM_HEADER_COLORS: Record<string, CSSProperties> = {
  "99FOOD": {
    backgroundColor: "#FFDD00",
    color: "#101820"
  },
  IFOOD: {
    backgroundColor: "#EA1D2C",
    color: "#FFFFFF"
  },
  KEETA: {
    backgroundColor: "#0DAD87",
    color: "#101820"
  }
};

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

export function formatPlatformName(platform: string) {
  const names: Record<string, string> = {
    "99FOOD": "99Food",
    IFOOD: "iFood",
    KEETA: "Keeta"
  };

  return names[platform.toUpperCase()] ?? platform;
}

export function getPlatformHeaderStyle(platform: string): CSSProperties {
  return PLATFORM_HEADER_COLORS[platform.toUpperCase()] ?? {};
}

export function formatOrderStatus(status: Order["status"]) {
  if (status === "CANCELADO") {
    return "EXCLUIDO";
  }

  return status.replace("_", " ");
}
