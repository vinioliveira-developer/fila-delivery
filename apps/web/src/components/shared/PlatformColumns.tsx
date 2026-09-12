import {
  CSSProperties,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { Order } from "../../types/order";
import {
  formatPlatformName,
  getPlatformHeaderStyle,
  getUniquePlatforms
} from "../../utils/orders";

const DEFAULT_PLATFORM_NUMBER_HEIGHT = 70;
const DEFAULT_PLATFORM_LIST_GAP = 10;

type PlatformColumnsProps = {
  orders: Order[];
  variant?: "preparing" | "ready";
};

type PlatformListStyle = CSSProperties & {
  "--platform-list-column-count"?: number;
};

type PlatformListLayout = {
  columnCount: number;
  rowsPerColumn: number;
};

function ordersByPlatform(orders: Order[]) {
  const visiblePlatforms = getUniquePlatforms(orders);

  return visiblePlatforms.reduce<Record<string, Order[]>>(
    (acc, platform) => {
      acc[platform] = orders.filter((order) => order.platform === platform);
      return acc;
    },
    {}
  );
}

type PlatformColumnProps = {
  orders: Order[];
  platform: string;
  useAutoColumns: boolean;
};

function PlatformColumn({
  orders,
  platform,
  useAutoColumns
}: PlatformColumnProps) {
  const columnRef = useRef<HTMLElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const firstNumberRef = useRef<HTMLDivElement | null>(null);
  const [listLayout, setListLayout] = useState<PlatformListLayout>({
    columnCount: 1,
    rowsPerColumn: 1
  });

  useLayoutEffect(() => {
    if (!useAutoColumns) {
      setListLayout({ columnCount: 1, rowsPerColumn: 1 });
      return;
    }

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
        ? Math.max(DEFAULT_PLATFORM_LIST_GAP, measuredGap)
        : DEFAULT_PLATFORM_LIST_GAP;
      const measuredPaddingTop = Number.parseFloat(listStyle.paddingTop);
      const measuredPaddingBottom = Number.parseFloat(listStyle.paddingBottom);
      const verticalPadding =
        (Number.isFinite(measuredPaddingTop) ? measuredPaddingTop : 0) +
        (Number.isFinite(measuredPaddingBottom) ? measuredPaddingBottom : 0);
      const measuredNumberHeight = firstNumberRef.current
        ? firstNumberRef.current.getBoundingClientRect().height
        : DEFAULT_PLATFORM_NUMBER_HEIGHT;
      const numberHeight =
        measuredNumberHeight > 0
          ? Math.max(DEFAULT_PLATFORM_NUMBER_HEIGHT, measuredNumberHeight)
          : DEFAULT_PLATFORM_NUMBER_HEIGHT;
      const availableHeight =
        columnElement.getBoundingClientRect().bottom -
        listElement.getBoundingClientRect().top -
        verticalPadding;

      if (availableHeight <= 0) {
        return;
      }

      const rowsPerColumn = Math.max(
        1,
        Math.floor((availableHeight + gap) / (numberHeight + gap))
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

    const observer = new ResizeObserver(() => updateLayout());

    if (columnRef.current) {
      observer.observe(columnRef.current);
    }

    if (listRef.current) {
      observer.observe(listRef.current);
    }

    return () => observer.disconnect();
  }, [orders.length, useAutoColumns]);

  const orderColumns = useMemo(() => {
    return Array.from({ length: listLayout.columnCount }, (_, columnIndex) => {
      const start = columnIndex * listLayout.rowsPerColumn;
      return orders.slice(start, start + listLayout.rowsPerColumn);
    });
  }, [listLayout, orders]);

  const listStyle = useMemo<PlatformListStyle>(
    () => ({
      "--platform-list-column-count": listLayout.columnCount
    }),
    [listLayout.columnCount]
  );

  return (
    <section className="platform-column" key={platform} ref={columnRef}>
      <header style={getPlatformHeaderStyle(platform)}>
        {formatPlatformName(platform)}
      </header>

      <div
        className={
          useAutoColumns && listLayout.columnCount > 1
            ? "platform-list platform-list-multiple-columns"
            : "platform-list"
        }
        ref={listRef}
        style={useAutoColumns ? listStyle : undefined}
      >
        {useAutoColumns
          ? orderColumns.map((orderColumn, columnIndex) => (
              <div className="platform-list-column" key={columnIndex}>
                {orderColumn.map((order, orderIndex) => (
                  <div
                    className="platform-number"
                    key={order.id}
                    ref={
                      columnIndex === 0 && orderIndex === 0
                        ? firstNumberRef
                        : undefined
                    }
                  >
                    {order.number}
                  </div>
                ))}
              </div>
            ))
          : orders.map((order, orderIndex) => (
              <div
                className="platform-number"
                key={order.id}
                ref={orderIndex === 0 ? firstNumberRef : undefined}
              >
                {order.number}
              </div>
            ))}
      </div>
    </section>
  );
}

export function PlatformColumns({
  orders,
  variant = "preparing"
}: PlatformColumnsProps) {
  const grouped = ordersByPlatform(orders);
  const visiblePlatforms = getUniquePlatforms(orders);
  const useAutoColumns = variant === "ready";

  return (
    <div className={`platform-board ${variant}`}>
      {visiblePlatforms.map((platform) => (
        <PlatformColumn
          key={platform}
          orders={grouped[platform]}
          platform={platform}
          useAutoColumns={useAutoColumns}
        />
      ))}
    </div>
  );
}
