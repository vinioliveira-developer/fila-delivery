import { useEffect, useMemo, useRef } from "react";
import { PlatformColumns } from "../components/shared/PlatformColumns";
import { useOrders } from "../hooks/useOrders";
import { playReadyNotification } from "../utils/readyNotificationAudio";

export function TvReady() {
  const { isLoading, orders, ordersError } = useOrders();
  const audioContextRef = useRef<AudioContext | null>(null);
  const knownReadyOrderIdsRef = useRef<Set<string>>(new Set());
  const hasInitializedReadyAudioRef = useRef(false);
  const ready = useMemo(
    () => orders.filter((order) => order.status === "PRONTO"),
    [orders]
  );
  const readyOrderIds = useMemo(
    () => ready.map((order) => order.id),
    [ready]
  );

  useEffect(() => {
    if (isLoading || ordersError) {
      return;
    }

    const currentReadyOrderIds = new Set(readyOrderIds);

    if (!hasInitializedReadyAudioRef.current) {
      knownReadyOrderIdsRef.current = currentReadyOrderIds;
      hasInitializedReadyAudioRef.current = true;
      return;
    }

    const hasNewReadyOrder = readyOrderIds.some(
      (orderId) => !knownReadyOrderIdsRef.current.has(orderId)
    );
    knownReadyOrderIdsRef.current = currentReadyOrderIds;

    if (!hasNewReadyOrder) {
      return;
    }

    void playReadyNotification(audioContextRef);
  }, [isLoading, ordersError, readyOrderIds]);

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
