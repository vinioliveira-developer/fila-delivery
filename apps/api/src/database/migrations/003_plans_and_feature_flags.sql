CREATE TABLE IF NOT EXISTS plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price_cents INTEGER NOT NULL DEFAULT 0 CHECK(price_cents >= 0),
  billing_cycle TEXT NOT NULL DEFAULT 'MONTHLY'
    CHECK(billing_cycle IN ('MONTHLY', 'QUARTERLY', 'SEMIANNUAL', 'ANNUAL')),
  user_limit INTEGER CHECK(user_limit IS NULL OR user_limit > 0),
  history_days INTEGER NOT NULL DEFAULT 7 CHECK(history_days > 0),
  restaurant_limit INTEGER NOT NULL DEFAULT 1 CHECK(restaurant_limit > 0),
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE', 'INACTIVE')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT
);

CREATE TABLE IF NOT EXISTS feature_flags (
  id TEXT PRIMARY KEY,
  feature_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'GENERAL',
  enabled_by_default INTEGER NOT NULL DEFAULT 0 CHECK(enabled_by_default IN (0, 1)),
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE', 'INACTIVE')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT
);

CREATE TABLE IF NOT EXISTS plan_features (
  id TEXT PRIMARY KEY,
  plan_id TEXT NOT NULL,
  feature_id TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1 CHECK(enabled IN (0, 1)),
  limit_value INTEGER,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (plan_id, feature_id),
  FOREIGN KEY (plan_id) REFERENCES plans(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  FOREIGN KEY (feature_id) REFERENCES feature_flags(id) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS restaurant_features (
  id TEXT PRIMARY KEY,
  restaurant_id TEXT NOT NULL,
  feature_id TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1 CHECK(enabled IN (0, 1)),
  override_enabled INTEGER NOT NULL DEFAULT 0 CHECK(override_enabled IN (0, 1)),
  limit_value INTEGER,
  reason TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  UNIQUE (restaurant_id, feature_id),
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  FOREIGN KEY (feature_id) REFERENCES feature_flags(id) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_plans_status ON plans (status);
CREATE INDEX IF NOT EXISTS idx_feature_flags_status ON feature_flags (status);
CREATE INDEX IF NOT EXISTS idx_plan_features_plan ON plan_features (plan_id);
CREATE INDEX IF NOT EXISTS idx_plan_features_feature ON plan_features (feature_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_features_restaurant ON restaurant_features (restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_features_feature ON restaurant_features (feature_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_features_deleted_at ON restaurant_features (deleted_at);
