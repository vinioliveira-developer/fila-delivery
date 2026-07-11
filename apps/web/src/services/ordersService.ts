import { Order, OrderStatus, Platform } from "../types/order";
import { httpRequest } from "./http/httpClient";

export type CreateOrderInput = {
  number: string;
  platform: Platform;
  status?: Extract<OrderStatus, "EM_PREPARO" | "PRONTO">;
  note?: string;
};

export const OrdersService = {
  list() {
    return httpRequest<{ orders: Order[] }>("/orders");
  },

  create(input: CreateOrderInput) {
    return httpRequest<{ order: Order }>("/orders", {
      method: "POST",
      body: JSON.stringify(input)
    });
  },

  updateStatus(orderId: string, status: OrderStatus) {
    return httpRequest<{ order: Order }>(`/orders/${orderId}`, {
      method: "PATCH",
      body: JSON.stringify({ status })
    });
  },

  clearFinalized() {
    return httpRequest<void>("/orders/finalized", { method: "DELETE" });
  }
};
