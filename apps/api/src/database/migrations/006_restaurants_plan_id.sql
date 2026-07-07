ALTER TABLE restaurants ADD COLUMN plan_id TEXT;

CREATE INDEX IF NOT EXISTS idx_restaurants_plan_id ON restaurants(plan_id);
