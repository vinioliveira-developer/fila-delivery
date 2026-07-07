import { PlatformColumns } from "../components/shared/PlatformColumns";
import { useOrders } from "../hooks/useOrders";

export function TvPreparing() {
  const { isLoading, orders, ordersError } = useOrders();
  const preparing = orders.filter((order) => order.status === "EM_PREPARO");

  return (
    <section className="tv-page preparing-tv">
      <div className="tv-header">
        <p>Pedidos em preparo</p>
        <span>{preparing.length} na fila</span>
      </div>

      {isLoading ? <p>Carregando pedidos...</p> : null}
      {ordersError ? <p>{ordersError}</p> : null}
      {!isLoading && !ordersError ? (
        <PlatformColumns orders={preparing} variant="preparing" />
      ) : null}
    </section>
  );
}
