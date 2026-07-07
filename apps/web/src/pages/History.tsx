import { useState } from "react";
import { EmptyState } from "../components/shared/EmptyState";
import { OrderCard } from "../components/shared/OrderCard";
import { useOrders } from "../hooks/useOrders";
import {
  formatDateLabel,
  getOrderFinalizedAt,
  lastSevenDays,
  toDateKey
} from "../utils/date";

export function History() {
  const { isLoading, orders, ordersError, clearDeliveredAndCanceled } = useOrders();
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()));
  const dayOptions = lastSevenDays();
  const finished = orders.filter(
    (order) =>
      (order.status === "ENTREGUE" || order.status === "CANCELADO") &&
      getOrderFinalizedAt(order).slice(0, 10) === selectedDate
  );

  return (
    <section className="page">
      <div className="page-header row-header">
        <div>
          <p className="eyebrow">Historico</p>
          <h2>Pedidos finalizados</h2>
        </div>
        <button className="ghost-button" onClick={clearDeliveredAndCanceled} type="button">
          Limpar finalizados
        </button>
      </div>

      <div className="history-calendar">
        {dayOptions.map((dateKey) => (
          <button
            className={
              selectedDate === dateKey ? "date-filter active" : "date-filter"
            }
            key={dateKey}
            onClick={() => setSelectedDate(dateKey)}
            type="button"
          >
            {formatDateLabel(dateKey)}
          </button>
        ))}
      </div>

      <div className="order-grid">
        {isLoading ? <EmptyState title="Carregando historico..." /> : null}
        {ordersError ? <p className="form-error">{ordersError}</p> : null}
        {finished.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
        {!isLoading && !ordersError && finished.length === 0 ? (
          <EmptyState title="Nenhum pedido finalizado nesta data." />
        ) : null}
      </div>
    </section>
  );
}
