import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CreateOrderInput,
  OrdersService
} from "../services/ordersService";
import { Order, OrderStatus } from "../types/order";
import { pruneOldFinishedOrders } from "../utils/orders";
import { usePolling } from "./usePolling";

type AddOrderResult =
  | { ok: true }
  | {
      ok: false;
      reason: "EMPTY" | "DUPLICATE" | "API_ERROR";
      duplicate?: Order;
      message?: string;
    };

const ORDERS_POLLING_INTERVAL_MS = 2000;

function areOrdersEqual(current: Order[], next: Order[]) {
  return JSON.stringify(current) === JSON.stringify(next);
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");
  const isMountedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const refreshOrders = useCallback(async (clearOnError = false) => {
    try {
      const response = await OrdersService.list();

      if (!isMountedRef.current) {
        return;
      }

      const nextOrders = pruneOldFinishedOrders(response.orders);

      setOrders((current) =>
        areOrdersEqual(current, nextOrders) ? current : nextOrders
      );
      setOrdersError("");
    } catch (error) {
      if (!isMountedRef.current) {
        return;
      }

      if (clearOnError) {
        setOrders([]);
      }

      setOrdersError(
        error instanceof Error ? error.message : "Erro ao carregar pedidos."
      );
    }
  }, []);

  useEffect(() => {
    refreshOrders(true).finally(() => {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    });
  }, [refreshOrders]);

  usePolling(() => refreshOrders(false), ORDERS_POLLING_INTERVAL_MS);

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
              status: input.status ?? "EM_PREPARO",
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
