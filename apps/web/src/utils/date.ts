import { Order } from "../types/order";

export function formatTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export function minutesSince(value: string) {
  return Math.max(
    0,
    Math.round((Date.now() - new Date(value).getTime()) / 60000)
  );
}

export function getOrderFinalizedAt(order: Order) {
  return order.deliveredAt ?? order.canceledAt ?? order.createdAt;
}

export function toDateKey(value: Date) {
  return value.toISOString().slice(0, 10);
}

export function lastSevenDays() {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - index);
    return toDateKey(date);
  });
}

export function formatDateLabel(dateKey: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit"
  }).format(new Date(`${dateKey}T12:00:00`));
}
