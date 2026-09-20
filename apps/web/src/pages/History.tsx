import { useMemo, useState } from "react";
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
  const [search, setSearch] = useState("");
  const dayOptions = lastSevenDays();
  const searchTerm = search.trim().toLowerCase();
  const historicalOrders = useMemo(
    () =>
      orders.filter(
        (order) => order.status === "ENTREGUE" || order.status === "CANCELADO"
      ),
    [orders]
  );
  const finished = useMemo(
    () =>
      searchTerm
        ? historicalOrders.filter(
            (order) =>
              order.number.toLowerCase().includes(searchTerm) ||
              order.id.toLowerCase().includes(searchTerm)
          )
        : historicalOrders.filter(
            (order) => getOrderFinalizedAt(order).slice(0, 10) === selectedDate
          ),
    [historicalOrders, searchTerm, selectedDate]
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

      <div className="toolbar history-search">
        <input
          aria-label="Buscar pedido no historico"
          inputMode="numeric"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar pedido..."
          value={search}
        />
        {searchTerm ? (
          <button className="ghost-button" onClick={() => setSearch("")} type="button">
            Limpar
          </button>
        ) : null}
      </div>

      <div className="order-grid">
        {isLoading ? <EmptyState title="Carregando historico..." /> : null}
        {ordersError ? <p className="form-error">{ordersError}</p> : null}
        {finished.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
        {!isLoading && !ordersError && finished.length === 0 ? (
          <EmptyState
            title={
              searchTerm
                ? "Nenhum pedido encontrado."
                : "Nenhum pedido finalizado nesta data."
            }
          />
        ) : null}
      </div>
    </section>
  );
}
