import {
  CSSProperties,
  FormEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { EmptyState } from "../components/shared/EmptyState";
import { useOrders } from "../hooks/useOrders";
import { Order, Platform } from "../types/order";
import { formatPlatformName, getPlatformHeaderStyle } from "../utils/orders";

const MANUAL_PLATFORMS: Platform[] = ["IFOOD", "99FOOD", "KEETA"];
const DEFAULT_ORDER_BUTTON_HEIGHT = 58;
const DEFAULT_ORDER_LIST_GAP = 10;

type ManualOrderListStyle = CSSProperties & {
  "--manual-order-column-count"?: number;
};

type ManualOrderListLayout = {
  columnCount: number;
  rowsPerColumn: number;
};

type ManualOrderPlatformColumnProps = {
  orders: Order[];
  platform: Platform;
  onSelectOrder: (order: Order) => void;
};

type WindowWithWebkitAudio = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

function ManualOrderPlatformColumn({
  orders,
  platform,
  onSelectOrder
}: ManualOrderPlatformColumnProps) {
  const columnRef = useRef<HTMLElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const firstButtonRef = useRef<HTMLButtonElement | null>(null);
  const [listLayout, setListLayout] = useState<ManualOrderListLayout>({
    columnCount: 1,
    rowsPerColumn: 1
  });

  useLayoutEffect(() => {
    function updateLayout() {
      const listElement = listRef.current;
      const columnElement = columnRef.current;

      if (!listElement || !columnElement || orders.length === 0) {
        setListLayout({ columnCount: 1, rowsPerColumn: 1 });
        return;
      }

      const listStyle = window.getComputedStyle(listElement);
      const measuredGap = Number.parseFloat(listStyle.rowGap);
      const gap = Number.isFinite(measuredGap)
        ? Math.max(DEFAULT_ORDER_LIST_GAP, measuredGap)
        : DEFAULT_ORDER_LIST_GAP;
      const measuredButtonHeight = firstButtonRef.current
        ? firstButtonRef.current.getBoundingClientRect().height
        : DEFAULT_ORDER_BUTTON_HEIGHT;
      const buttonHeight =
        measuredButtonHeight > 0
          ? Math.max(DEFAULT_ORDER_BUTTON_HEIGHT, measuredButtonHeight)
          : DEFAULT_ORDER_BUTTON_HEIGHT;
      const availableHeight =
        columnElement.getBoundingClientRect().bottom -
        listElement.getBoundingClientRect().top;

      if (availableHeight <= 0) {
        return;
      }

      const rowsPerColumn = Math.max(
        1,
        Math.floor((availableHeight + gap) / (buttonHeight + gap))
      );
      const columnCount = Math.max(1, Math.ceil(orders.length / rowsPerColumn));

      setListLayout((current) =>
        current.columnCount === columnCount &&
        current.rowsPerColumn === rowsPerColumn
          ? current
          : { columnCount, rowsPerColumn }
      );
    }

    updateLayout();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateLayout);
      return () => window.removeEventListener("resize", updateLayout);
    }

    const observedColumn = columnRef.current;
    const observer = new ResizeObserver(() => updateLayout());

    if (observedColumn) {
      observer.observe(observedColumn);
    }

    if (listRef.current) {
      observer.observe(listRef.current);
    }

    return () => observer.disconnect();
  }, [orders.length]);

  const orderColumns = useMemo(() => {
    return Array.from({ length: listLayout.columnCount }, (_, columnIndex) => {
      const start = columnIndex * listLayout.rowsPerColumn;
      return orders.slice(start, start + listLayout.rowsPerColumn);
    });
  }, [listLayout, orders]);

  const listStyle = useMemo<ManualOrderListStyle>(
    () => ({
      "--manual-order-column-count": listLayout.columnCount
    }),
    [listLayout.columnCount]
  );

  return (
    <section className="manual-order-column" key={platform} ref={columnRef}>
      <div
        className="section-title platform-card-header"
        style={getPlatformHeaderStyle(platform)}
      >
        <h3>{formatPlatformName(platform)}</h3>
        <span style={{ color: getPlatformHeaderStyle(platform).color }}>
          {orders.length} pedidos
        </span>
      </div>

      <div
        className={
          listLayout.columnCount > 1
            ? "manual-order-list manual-order-list-multiple-columns"
            : "manual-order-list"
        }
        ref={listRef}
        style={listStyle}
      >
        {orders.length > 0
          ? orderColumns.map((orderColumn, columnIndex) => (
              <div className="manual-order-list-column" key={columnIndex}>
                {orderColumn.map((order, orderIndex) => (
                  <button
                    className="manual-order-button"
                    key={order.id}
                    onClick={() => onSelectOrder(order)}
                    ref={
                      columnIndex === 0 && orderIndex === 0 ? firstButtonRef : undefined
                    }
                    type="button"
                  >
                    {order.number}
                  </button>
                ))}
              </div>
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
  const knownReadyOrderIdsRef = useRef<Set<string>>(new Set());
  const hasInitializedReadyAudioRef = useRef(false);
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
  const readyOrderIds = useMemo(
    () => allReadyOrders.map((order) => order.id),
    [allReadyOrders]
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

  const playReadyNotification = useCallback(async () => {
    const AudioContextConstructor =
      window.AudioContext ??
      (window as WindowWithWebkitAudio).webkitAudioContext;

    if (!AudioContextConstructor) {
      return true;
    }

    try {
      const audioContext =
        audioContextRef.current ?? new AudioContextConstructor();
      audioContextRef.current = audioContext;

      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }

      const startTime = audioContext.currentTime;
      const masterGain = audioContext.createGain();
      const notes = [
        { frequency: 659.25, startOffset: 0, duration: 0.34, peak: 0.13 },
        { frequency: 880, startOffset: 0.13, duration: 0.38, peak: 0.11 },
        { frequency: 1174.66, startOffset: 0.28, duration: 0.48, peak: 0.08 }
      ];

      masterGain.gain.setValueAtTime(0.82, startTime);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.86);
      masterGain.connect(audioContext.destination);

      notes.forEach(({ frequency, startOffset, duration, peak }) => {
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        const noteStart = startTime + startOffset;
        const noteEnd = noteStart + duration;

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(frequency, noteStart);
        oscillator.frequency.exponentialRampToValueAtTime(
          frequency * 0.985,
          noteEnd
        );
        gain.gain.setValueAtTime(0.0001, noteStart);
        gain.gain.exponentialRampToValueAtTime(peak, noteStart + 0.018);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteEnd);

        oscillator.connect(gain);
        gain.connect(masterGain);
        oscillator.start(noteStart);
        oscillator.stop(noteEnd + 0.02);
      });

      return true;
    } catch {
      return false;
    }
  }, []);

  async function handleEnableAudio() {
    const didPlay = await playReadyNotification();
    setNeedsAudioActivation(!didPlay);
  }

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

    playReadyNotification().then((didPlay) => {
      setNeedsAudioActivation(!didPlay);
    });
  }, [isLoading, ordersError, playReadyNotification, readyOrderIds]);

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
