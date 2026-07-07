import { Platform } from "./platform";

export type { Platform };

export type OrderStatus = "EM_PREPARO" | "PRONTO" | "ENTREGUE" | "CANCELADO";

export type Order = {
  id: string;
  number: string;
  platform: Platform;
  status: OrderStatus;
  createdAt: string;
  readyAt?: string;
  deliveredAt?: string;
  canceledAt?: string;
  note?: string;
};
