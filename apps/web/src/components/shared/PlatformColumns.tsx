import { Order } from "../../types/order";
import {
  formatPlatformName,
  getPlatformHeaderStyle,
  getUniquePlatforms
} from "../../utils/orders";

type PlatformColumnsProps = {
  orders: Order[];
  variant?: "preparing" | "ready";
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

export function PlatformColumns({
  orders,
  variant = "preparing"
}: PlatformColumnsProps) {
  const grouped = ordersByPlatform(orders);
  const visiblePlatforms = getUniquePlatforms(orders);

  return (
    <div className={`platform-board ${variant}`}>
      {visiblePlatforms.map((platform) => (
        <section className="platform-column" key={platform}>
          <header style={getPlatformHeaderStyle(platform)}>
            {formatPlatformName(platform)}
          </header>

          <div className="platform-list">
            {grouped[platform].map((order) => (
              <div className="platform-number" key={order.id}>
                {order.number}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
