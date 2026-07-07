import { PlatformColumns } from "../components/shared/PlatformColumns";
import { useOrders } from "../hooks/useOrders";

export function TvReady() {
  const { isLoading, orders, ordersError } = useOrders();
  const ready = orders.filter((order) => order.status === "PRONTO");

  return (
    <section className="tv-page ready-tv">
      <div className="tv-header">
        <p>Pedidos prontos</p>
        <span>{ready.length} aguardando retirada</span>
      </div>

      {isLoading ? <p>Carregando pedidos...</p> : null}
      {ordersError ? <p>{ordersError}</p> : null}
      {!isLoading && !ordersError ? (
        <PlatformColumns orders={ready} variant="ready" />
      ) : null}
    </section>
  );
}
