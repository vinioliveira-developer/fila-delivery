import {
  FormEvent,
  useMemo,
  useRef,
  useState
} from "react";
import { EmptyState } from "../components/shared/EmptyState";
import { useOrders } from "../hooks/useOrders";
import { Order, Platform } from "../types/order";
import { playReadyNotification } from "../utils/readyNotificationAudio";
import { formatPlatformName, getPlatformHeaderStyle } from "../utils/orders";

const MANUAL_PLATFORMS: Platform[] = ["IFOOD", "99FOOD", "KEETA"];

type ManualOrderPlatformColumnProps = {
  orders: Order[];
  platform: Platform;
  onSelectOrder: (order: Order) => void;
};

function ManualOrderPlatformColumn({
  orders,
  platform,
  onSelectOrder
}: ManualOrderPlatformColumnProps) {
  return (
    <section className="manual-order-column" key={platform}>
      <div
        className="section-title platform-card-header"
        style={getPlatformHeaderStyle(platform)}
      >
        <h3>{formatPlatformName(platform)}</h3>
        <span style={{ color: getPlatformHeaderStyle(platform).color }}>
          {orders.length} pedidos
        </span>
      </div>

      <div className="manual-order-list">
        {orders.length > 0
          ? orders.map((order) => (
              <button
                className="manual-order-button"
                key={order.id}
                onClick={() => onSelectOrder(order)}
                type="button"
              >
                {order.number}
              </button>
            ))
          : null}

        {orders.length === 0 ? <EmptyState title="Nenhum pedido pronto." /> : null}
      </div>
    </section>
  );
}

export function ReadyCheck() {
  const { addOrder, isLoading, orders, ordersError, updateStatus } = useOrders();
  const audioContextRef = useRef<AudioContext | null>(null);
  const [numbersByPlatform, setNumbersByPlatform] = useState<Record<Platform, string>>(
    {}
  );
  const [errorsByPlatform, setErrorsByPlatform] = useState<
    Partial<Record<Platform, string>>
  >({});
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [actionError, setActionError] = useState("");
  const [needsAudioActivation, setNeedsAudioActivation] = useState(true);
  const searchTerm = search.trim();
  const allReadyOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          order.status === "PRONTO" &&
          MANUAL_PLATFORMS.includes(order.platform.toUpperCase())
      ),
    [orders]
  );
  const readyOrders = useMemo(
    () => allReadyOrders.filter((order) => order.number.includes(searchTerm)),
    [allReadyOrders, searchTerm]
  );

  const ordersByPlatform = useMemo(
    () =>
      MANUAL_PLATFORMS.reduce<Record<Platform, Order[]>>((grouped, platform) => {
        grouped[platform] = readyOrders.filter(
          (order) => order.platform.toUpperCase() === platform
        );
        return grouped;
      }, {}),
    [readyOrders]
  );

  async function handleEnableAudio() {
    const didPlay = await playReadyNotification(audioContextRef);
    setNeedsAudioActivation(!didPlay);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>, platform: Platform) {
    event.preventDefault();

    const result = await addOrder({
      number: numbersByPlatform[platform] ?? "",
      platform,
      status: "PRONTO"
    });

    if (!result.ok) {
      setErrorsByPlatform((current) => ({
        ...current,
        [platform]:
          result.reason === "DUPLICATE"
            ? `Pedido ${result.duplicate?.number} ja esta ativo em ${formatPlatformName(platform)}.`
            : result.reason === "API_ERROR"
              ? result.message
              : "Digite o numero do pedido."
      }));
      return;
    }

    setErrorsByPlatform((current) => ({ ...current, [platform]: undefined }));
    setNumbersByPlatform((current) => ({ ...current, [platform]: "" }));
  }

  async function finishSelectedOrder(status: "ENTREGUE" | "CANCELADO") {
    if (!selectedOrder) {
      return;
    }

    try {
      await updateStatus(selectedOrder.id, status);
      setSelectedOrder(null);
      setActionError("");
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Erro ao atualizar pedido."
      );
    }
  }

  return (
    <section className="page ready-check-page">
      <div className="page-header">
        <p className="eyebrow">Conferencia</p>
        <h2>Pedidos prontos</h2>
        <p>Cadastre manualmente os pedidos prontos para retirada.</p>
      </div>

      <div className="platform-entry-grid manual-order-entry-grid">
        {MANUAL_PLATFORMS.map((platform, index) => (
          <form
            className="platform-entry"
            key={platform}
            onSubmit={(event) => handleSubmit(event, platform)}
          >
            <h3
              className="platform-card-header"
              style={getPlatformHeaderStyle(platform)}
            >
              {formatPlatformName(platform)}
            </h3>

            <label>
              Numero do pedido
              <input
                autoFocus={index === 0}
                inputMode="numeric"
                onChange={(event) =>
                  setNumbersByPlatform((current) => ({
                    ...current,
                    [platform]: event.target.value
                  }))
                }
                placeholder="Ex: 1756"
                value={numbersByPlatform[platform] ?? ""}
              />
            </label>

            <button className="primary-button" type="submit">
              Adicionar
            </button>

            {errorsByPlatform[platform] ? (
              <p className="form-error">{errorsByPlatform[platform]}</p>
            ) : null}
          </form>
        ))}
      </div>

      <div className="toolbar ready-check-toolbar">
        <input
          aria-label="Pesquisar pedido"
          inputMode="numeric"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Pesquisar pedido..."
          value={search}
        />
        {needsAudioActivation ? (
          <button
            className="ghost-button ready-audio-button"
            onClick={handleEnableAudio}
            type="button"
          >
            Ativar som
          </button>
        ) : null}
      </div>

      <div className="manual-order-board">
        {isLoading ? <EmptyState title="Carregando pedidos..." /> : null}
        {ordersError ? <p className="form-error">{ordersError}</p> : null}

        {!isLoading && !ordersError
          ? MANUAL_PLATFORMS.map((platform) => (
              <ManualOrderPlatformColumn
                key={platform}
                onSelectOrder={(order) => {
                  setSelectedOrder(order);
                  setActionError("");
                }}
                orders={ordersByPlatform[platform] ?? []}
                platform={platform}
              />
            ))
          : null}
      </div>

      {selectedOrder ? (
        <div className="modal-backdrop" role="presentation">
          <div aria-modal="true" className="confirm-modal" role="dialog">
            <div>
              <p className="eyebrow">{formatPlatformName(selectedOrder.platform)}</p>
              <h2>Pedido #{selectedOrder.number}</h2>
              {actionError ? <p className="form-error">{actionError}</p> : null}
            </div>

            <div className="manual-modal-actions">
              <button
                className="success-button"
                onClick={() => finishSelectedOrder("ENTREGUE")}
                type="button"
              >
                Entregue
              </button>
              <button
                className="danger-button"
                onClick={() => finishSelectedOrder("CANCELADO")}
                type="button"
              >
                Excluir
              </button>
              <button
                className="ghost-button"
                onClick={() => setSelectedOrder(null)}
                type="button"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
