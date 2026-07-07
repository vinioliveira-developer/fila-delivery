import { useState } from "react";
import { ConfirmModal } from "../components/shared/ConfirmModal";
import { EmptyState } from "../components/shared/EmptyState";
import { OrderCard } from "../components/shared/OrderCard";
import { useOrders } from "../hooks/useOrders";
import { Order } from "../types/order";

export function ReadyCheck() {
  const { isLoading, orders, ordersError, updateStatus } = useOrders();
  const [search, setSearch] = useState("");
  const [pendingOrder, setPendingOrder] = useState<Order | null>(null);
  const preparing = orders.filter((order) => order.status === "EM_PREPARO");
  const filtered = preparing.filter((order) => order.number.includes(search.trim()));

  function confirmReady() {
    if (!pendingOrder) {
      return;
    }

    updateStatus(pendingOrder.id, "PRONTO");
    setPendingOrder(null);
  }

  return (
    <section className="page">
      <div className="page-header">
        <p className="eyebrow">Conferencia</p>
        <h2>Marcar pedido como pronto</h2>
        <p>Use esta tela para a funcionaria que recebe os pedidos da cozinha.</p>
      </div>

      <div className="toolbar">
        <input
          aria-label="Buscar numero do pedido em preparo"
          autoFocus
          inputMode="numeric"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar numero do pedido"
          value={search}
        />
      </div>

      <div className="order-grid">
        {isLoading ? <EmptyState title="Carregando pedidos..." /> : null}
        {ordersError ? <p className="form-error">{ordersError}</p> : null}
        {filtered.map((order) => (
          <OrderCard
            actions={
              <button
                className="success-button"
                onClick={() => setPendingOrder(order)}
                type="button"
              >
                Marcar pronto
              </button>
            }
            key={order.id}
            order={order}
          />
        ))}
        {!isLoading && !ordersError && filtered.length === 0 ? (
          <EmptyState title="Nenhum pedido em preparo encontrado." />
        ) : null}
      </div>

      {pendingOrder ? (
        <ConfirmModal
          actionLabel="SIM"
          cancelLabel="NAO"
          description={`Pedido: ${pendingOrder.number} - ${pendingOrder.platform}`}
          onCancel={() => setPendingOrder(null)}
          onConfirm={confirmReady}
          title="Marcar como pronto?"
          variant="success"
        />
      ) : null}
    </section>
  );
}
