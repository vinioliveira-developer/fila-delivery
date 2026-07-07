ALTER TABLE restaurants ADD COLUMN deleted_at TEXT;
ALTER TABLE restaurants ADD COLUMN deleted_by TEXT;

ALTER TABLE users ADD COLUMN updated_at TEXT;
ALTER TABLE users ADD COLUMN deleted_at TEXT;
ALTER TABLE users ADD COLUMN deleted_by TEXT;

ALTER TABLE platforms ADD COLUMN updated_at TEXT;
ALTER TABLE platforms ADD COLUMN deleted_at TEXT;
ALTER TABLE platforms ADD COLUMN deleted_by TEXT;

ALTER TABLE orders ADD COLUMN updated_at TEXT;
ALTER TABLE orders ADD COLUMN deleted_at TEXT;
ALTER TABLE orders ADD COLUMN deleted_by TEXT;

UPDATE users SET updated_at = created_at WHERE updated_at IS NULL;
UPDATE platforms SET updated_at = created_at WHERE updated_at IS NULL;
UPDATE orders SET updated_at = created_at WHERE updated_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_restaurants_status ON restaurants (status);
CREATE INDEX IF NOT EXISTS idx_restaurants_expires_at ON restaurants (expires_at);
CREATE INDEX IF NOT EXISTS idx_restaurants_deleted_at ON restaurants (deleted_at);

CREATE INDEX IF NOT EXISTS idx_users_restaurant_id ON users (restaurant_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users (active);
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users (deleted_at);

CREATE INDEX IF NOT EXISTS idx_platforms_restaurant_id ON platforms (restaurant_id);
CREATE INDEX IF NOT EXISTS idx_platforms_deleted_at ON platforms (deleted_at);

CREATE INDEX IF NOT EXISTS idx_orders_restaurant_id ON orders (restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant_status ON orders (restaurant_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant_created ON orders (restaurant_id, created_at);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant_number ON orders (restaurant_id, order_number);
CREATE INDEX IF NOT EXISTS idx_orders_deleted_at ON orders (deleted_at);

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_active_unique
  ON orders (restaurant_id, platform, order_number)
  WHERE deleted_at IS NULL AND status IN ('EM_PREPARO', 'PRONTO');
