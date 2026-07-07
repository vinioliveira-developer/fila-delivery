import { Order } from "../../types/order";
import { formatTime, minutesSince } from "../../utils/date";

type OrderCardProps = {
  order: Order;
  actions?: React.ReactNode;
  compact?: boolean;
};

export function OrderCard({ order, actions, compact = false }: OrderCardProps) {
  return (
    <article className={compact ? "order-card compact" : "order-card"}>
      <div>
        <span className={`status-pill ${order.status.toLowerCase()}`}>
          {order.status.replace("_", " ")}
        </span>
        <h3>{order.number}</h3>
        <p>{order.platform}</p>
      </div>

      <div className="order-meta">
        <span>Entrada {formatTime(order.createdAt)}</span>
        <span>{minutesSince(order.createdAt)} min</span>
      </div>

      {order.note ? <p className="order-note">{order.note}</p> : null}
      {actions ? <div className="order-actions">{actions}</div> : null}
    </article>
  );
}
