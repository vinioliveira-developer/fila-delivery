import { useState } from "react";
import { ConfirmModal } from "../components/shared/ConfirmModal";
import { EmptyState } from "../components/shared/EmptyState";
import { OrderCard } from "../components/shared/OrderCard";
import { useOrders } from "../hooks/useOrders";
import { Order, OrderStatus } from "../types/order";

type PendingAction = {
  order: Order;
  status: Extract<OrderStatus, "ENTREGUE" | "CANCELADO" | "EM_PREPARO" | "PRONTO">;
} | null;

export function Delivery() {
  const { isLoading, orders, ordersError, updateStatus } = useOrders();
  const [search, setSearch] = useState("");
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const ready = orders.filter((order) => order.status === "PRONTO");
  const finished = orders.filter(
    (order) => order.status === "ENTREGUE" || order.status === "CANCELADO"
  );
  const filtered = ready.filter((order) => order.number.includes(search.trim()));

  const modalCopy = {
    ENTREGUE: {
      actionLabel: "Confirmar entrega",
      title: "Confirmar pedido entregue?",
      variant: "success" as const
    },
    CANCELADO: {
      actionLabel: "Confirmar cancelamento",
      title: "Confirmar cancelamento?",
      variant: "danger" as const
    },
    EM_PREPARO: {
      actionLabel: "Voltar para preparo",
      title: "Voltar pedido para preparo?",
      variant: "danger" as const
    },
    PRONTO: {
      actionLabel: "Voltar para prontos",
      title: "Voltar pedido para prontos?",
      variant: "success" as const
    }
  };

  function confirmAction() {
    if (!pendingAction) {
      return;
    }

    updateStatus(pendingAction.order.id, pendingAction.status);
    setPendingAction(null);
  }

  return (
    <section className="page mobile-workspace">
      <div className="page-header">
        <p className="eyebrow">Entrega</p>
        <h2>Baixa de retirada</h2>
        <p>Tela pensada para celular no balcao.</p>
      </div>

      <div className="toolbar">
        <input
          aria-label="Buscar pedido pronto"
          autoFocus
          inputMode="numeric"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar pedido pronto"
          value={search}
        />
      </div>

      <div className="order-list">
        {isLoading ? <EmptyState title="Carregando pedidos..." /> : null}
        {ordersError ? <p className="form-error">{ordersError}</p> : null}
        {filtered.map((order) => (
          <OrderCard
            actions={
              <>
                <button
                  className="success-button"
                  onClick={() => setPendingAction({ order, status: "ENTREGUE" })}
                  type="button"
                >
                  Entregue
                </button>
                <button
                  className="danger-button"
                  onClick={() => setPendingAction({ order, status: "CANCELADO" })}
                  type="button"
                >
                  Cancelar
                </button>
                <button
                  className="ghost-button"
                  onClick={() => setPendingAction({ order, status: "EM_PREPARO" })}
                  type="button"
                >
                  Voltar
                </button>
              </>
            }
            key={order.id}
            order={order}
          />
        ))}
        {!isLoading && !ordersError && filtered.length === 0 ? (
          <EmptyState title="Nenhum pedido pronto encontrado." />
        ) : null}
      </div>

      <div>
        <div className="section-title">
          <h3>Finalizados recentes</h3>
          <span>{finished.length} pedidos</span>
        </div>

        <div className="order-list">
          {finished.map((order) => (
            <OrderCard
              actions={
                <button
                  className="ghost-button"
                  onClick={() => setPendingAction({ order, status: "PRONTO" })}
                  type="button"
                >
                  Voltar para prontos
                </button>
              }
              compact
              key={order.id}
              order={order}
            />
          ))}
          {!isLoading && !ordersError && finished.length === 0 ? (
            <EmptyState title="Nenhum pedido finalizado recentemente." />
          ) : null}
        </div>
      </div>

      {pendingAction ? (
        <ConfirmModal
          actionLabel={modalCopy[pendingAction.status].actionLabel}
          description={`Pedido ${pendingAction.order.number} - ${pendingAction.order.platform}`}
          onCancel={() => setPendingAction(null)}
          onConfirm={confirmAction}
          title={modalCopy[pendingAction.status].title}
          variant={modalCopy[pendingAction.status].variant}
        />
      ) : null}
    </section>
  );
}
