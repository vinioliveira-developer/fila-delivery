import { useEffect, useMemo, useState } from "react";
import {
  CreateOrderInput,
  OrdersService
} from "../services/ordersService";
import { Order, OrderStatus } from "../types/order";
import { pruneOldFinishedOrders } from "../utils/orders";

type AddOrderResult =
  | { ok: true }
  | {
      ok: false;
      reason: "EMPTY" | "DUPLICATE" | "API_ERROR";
      duplicate?: Order;
      message?: string;
    };

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");

  useEffect(() => {
    let isMounted = true;

    OrdersService.list()
      .then((response) => {
        if (!isMounted) {
          return;
        }

        setOrders(pruneOldFinishedOrders(response.orders));
        setOrdersError("");
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        setOrders([]);
        setOrdersError(
          error instanceof Error ? error.message : "Erro ao carregar pedidos."
        );
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const actions = useMemo(
    () => ({
      async addOrder(input: CreateOrderInput): Promise<AddOrderResult> {
        const trimmedNumber = input.number.trim();

        if (!trimmedNumber) {
          return { ok: false, reason: "EMPTY" };
        }

        try {
          const response = await OrdersService.create({
            ...input,
            number: trimmedNumber
          });
          setOrders((current) => [response.order, ...current]);
          return { ok: true };
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Erro ao cadastrar pedido.";

          if (!message.toLowerCase().includes("ja existe")) {
            return { ok: false, reason: "API_ERROR", message };
          }

          return {
            ok: false,
            reason: "DUPLICATE",
            duplicate: {
              id: "",
              number: trimmedNumber,
              platform: input.platform,
              status: "EM_PREPARO",
              createdAt: new Date().toISOString()
            }
          };
        }
      },

      async updateStatus(orderId: string, status: OrderStatus) {
        const response = await OrdersService.updateStatus(orderId, status);
        setOrders((current) =>
          current.map((order) => (order.id === orderId ? response.order : order))
        );
      },

      async clearDeliveredAndCanceled() {
        await OrdersService.clearFinalized();
        setOrders((current) =>
          current.filter(
            (order) => order.status !== "ENTREGUE" && order.status !== "CANCELADO"
          )
        );
      }
    }),
    []
  );

  return { isLoading, orders, ordersError, ...actions };
}
