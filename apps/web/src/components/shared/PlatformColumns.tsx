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
const DEFAULT_READY_NUMBER_FONT_SIZE = 44;
const MIN_READY_NUMBER_FONT_SIZE = 12;
const READY_TARGET_COLUMN_WIDTH = 150;
const READY_DIGIT_WIDTH_RATIO = 0.62;

type PlatformColumnsProps = {
  orders: Order[];
  variant?: "preparing" | "ready";
};

type PlatformListStyle = CSSProperties & {
  "--platform-list-column-count"?: number;
  "--ready-grid-column-count"?: number;
  "--ready-grid-row-count"?: number;
  "--ready-number-font-size"?: string;
  "--ready-number-height"?: string;
  "--ready-number-padding"?: string;
};

type PlatformListLayout = {
  columnCount: number;
  fontSize: number;
  itemSpans: Record<string, number>;
  numberHeight: number;
  padding: number;
  rowsPerColumn: number;
};

type ReadyLayoutCandidate = PlatformListLayout & {
  score: number;
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
    fontSize: DEFAULT_READY_NUMBER_FONT_SIZE,
    itemSpans: {},
    numberHeight: DEFAULT_PLATFORM_NUMBER_HEIGHT,
    padding: 12,
    rowsPerColumn: 1
  });

  useLayoutEffect(() => {
    if (!useAutoColumns) {
      setListLayout({
        columnCount: 1,
        fontSize: DEFAULT_READY_NUMBER_FONT_SIZE,
        itemSpans: {},
        numberHeight: DEFAULT_PLATFORM_NUMBER_HEIGHT,
        padding: 12,
        rowsPerColumn: 1
      });
      return;
    }

    function updateLayout() {
      const listElement = listRef.current;
      const columnElement = columnRef.current;

      if (!listElement || !columnElement || orders.length === 0) {
        setListLayout({
          columnCount: 1,
          fontSize: DEFAULT_READY_NUMBER_FONT_SIZE,
          itemSpans: {},
          numberHeight: DEFAULT_PLATFORM_NUMBER_HEIGHT,
          padding: 12,
          rowsPerColumn: 1
        });
        return;
      }

      const listStyle = window.getComputedStyle(listElement);
      const measuredGap = Number.parseFloat(listStyle.rowGap);
      const gap = Number.isFinite(measuredGap)
        ? Math.max(DEFAULT_PLATFORM_LIST_GAP, measuredGap)
        : DEFAULT_PLATFORM_LIST_GAP;
      const measuredPaddingTop = Number.parseFloat(listStyle.paddingTop);
      const measuredPaddingBottom = Number.parseFloat(listStyle.paddingBottom);
      const measuredPaddingLeft = Number.parseFloat(listStyle.paddingLeft);
      const measuredPaddingRight = Number.parseFloat(listStyle.paddingRight);
      const verticalPadding =
        (Number.isFinite(measuredPaddingTop) ? measuredPaddingTop : 0) +
        (Number.isFinite(measuredPaddingBottom) ? measuredPaddingBottom : 0);
      const horizontalPadding =
        (Number.isFinite(measuredPaddingLeft) ? measuredPaddingLeft : 0) +
        (Number.isFinite(measuredPaddingRight) ? measuredPaddingRight : 0);
      const availableWidth = listElement.clientWidth - horizontalPadding;
      const availableHeight =
        columnElement.getBoundingClientRect().bottom -
        listElement.getBoundingClientRect().top -
        verticalPadding;

      if (availableWidth <= 0 || availableHeight <= 0) {
        return;
      }

      let bestLayout: ReadyLayoutCandidate | null = null;

      function getPadding(numberHeight: number) {
        return Math.max(2, Math.min(12, numberHeight * 0.16));
      }

      function getFontSize(
        numberHeight: number,
        columnWidth: number,
        padding: number
      ) {
        const normalDigitCount = Math.min(
          4,
          Math.max(1, ...orders.map((order) => order.number.length))
        );

        return Math.max(
          MIN_READY_NUMBER_FONT_SIZE,
          Math.min(
            DEFAULT_READY_NUMBER_FONT_SIZE,
            numberHeight * 0.62,
            ((columnWidth - padding * 2) / normalDigitCount) /
              READY_DIGIT_WIDTH_RATIO
          )
        );
      }

      function getItemSpans(
        columnCount: number,
        columnWidth: number,
        fontSize: number,
        padding: number
      ) {
        return orders.reduce<Record<string, number>>((spans, order) => {
          const neededWidth =
            order.number.length * fontSize * READY_DIGIT_WIDTH_RATIO +
            padding * 2;
          const span = Math.max(
            1,
            Math.min(
              columnCount,
              Math.ceil((neededWidth + gap) / (columnWidth + gap))
            )
          );

          spans[order.id] = span;
          return spans;
        }, {});
      }

      function countRows(columnCount: number, itemSpans: Record<string, number>) {
        let rowCount = 1;
        let usedColumns = 0;

        orders.forEach((order) => {
          const span = itemSpans[order.id] ?? 1;

          if (usedColumns > 0 && usedColumns + span > columnCount) {
            rowCount += 1;
            usedColumns = 0;
          }

          usedColumns += span;

          if (usedColumns >= columnCount) {
            usedColumns = 0;
            if (order !== orders[orders.length - 1]) {
              rowCount += 1;
            }
          }
        });

        return rowCount;
      }

      for (let columnCount = 1; columnCount <= orders.length; columnCount += 1) {
        const columnWidth =
          (availableWidth - gap * (columnCount - 1)) / columnCount;

        if (columnWidth <= 0) {
          continue;
        }

        let numberHeight = DEFAULT_PLATFORM_NUMBER_HEIGHT;
        let padding = getPadding(numberHeight);
        let fontSize = getFontSize(numberHeight, columnWidth, padding);
        let itemSpans = getItemSpans(columnCount, columnWidth, fontSize, padding);
        let rowsPerColumn = countRows(columnCount, itemSpans);
        const availableNumberHeight =
          (availableHeight - gap * (rowsPerColumn - 1)) / rowsPerColumn;

        if (availableNumberHeight <= 0) {
          continue;
        }

        numberHeight = Math.min(DEFAULT_PLATFORM_NUMBER_HEIGHT, availableNumberHeight);
        padding = getPadding(numberHeight);
        fontSize = getFontSize(numberHeight, columnWidth, padding);
        itemSpans = getItemSpans(columnCount, columnWidth, fontSize, padding);
        rowsPerColumn = countRows(columnCount, itemSpans);

        const totalHeight =
          rowsPerColumn * numberHeight + (rowsPerColumn - 1) * gap;

        if (totalHeight > availableHeight + 0.5) {
          const reducedHeight =
            (availableHeight - gap * (rowsPerColumn - 1)) / rowsPerColumn;

          if (reducedHeight <= 0) {
            continue;
          }

          numberHeight = reducedHeight;
          padding = getPadding(numberHeight);
          fontSize = getFontSize(numberHeight, columnWidth, padding);
          itemSpans = getItemSpans(columnCount, columnWidth, fontSize, padding);
          rowsPerColumn = countRows(columnCount, itemSpans);
        }

        const heightRatio = numberHeight / DEFAULT_PLATFORM_NUMBER_HEIGHT;
        const score =
          heightRatio * 1000 +
          fontSize * 8 -
          columnCount * 18 -
          rowsPerColumn * 0.2;

        if (!bestLayout || score > bestLayout.score) {
          bestLayout = {
            columnCount,
            fontSize,
            itemSpans,
            numberHeight,
            padding,
            rowsPerColumn,
            score
          };
        }
      }

      if (!bestLayout) {
        return;
      }

      setListLayout((current) =>
        current.columnCount === bestLayout.columnCount &&
        Math.abs(current.fontSize - bestLayout.fontSize) < 0.5 &&
        Math.abs(current.numberHeight - bestLayout.numberHeight) < 0.5 &&
        Math.abs(current.padding - bestLayout.padding) < 0.5 &&
        current.rowsPerColumn === bestLayout.rowsPerColumn &&
        orders.every(
          (order) =>
            current.itemSpans[order.id] === bestLayout.itemSpans[order.id]
        )
          ? current
          : bestLayout
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

  const listStyle = useMemo<PlatformListStyle>(
    () => ({
      "--platform-list-column-count": listLayout.columnCount,
      "--ready-grid-column-count": listLayout.columnCount,
      "--ready-grid-row-count": listLayout.rowsPerColumn,
      "--ready-number-font-size": `${listLayout.fontSize}px`,
      "--ready-number-height": `${listLayout.numberHeight}px`,
      "--ready-number-padding": `${listLayout.padding}px`
    }),
    [listLayout]
  );

  return (
    <section className="platform-column" key={platform} ref={columnRef}>
      <header style={getPlatformHeaderStyle(platform)}>
        {formatPlatformName(platform)}
      </header>

      <div
        className={
          useAutoColumns
            ? "platform-list platform-list-ready-fit"
            : "platform-list"
        }
        ref={listRef}
        style={useAutoColumns ? listStyle : undefined}
      >
        {useAutoColumns
          ? orders.map((order, orderIndex) => (
              <div
                className="platform-number"
                key={order.id}
                ref={orderIndex === 0 ? firstNumberRef : undefined}
                style={{ gridColumn: `span ${listLayout.itemSpans[order.id] ?? 1}` }}
              >
                {order.number}
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
