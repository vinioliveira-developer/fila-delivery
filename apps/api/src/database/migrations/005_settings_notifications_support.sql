CREATE TABLE IF NOT EXISTS system_settings (
  id TEXT PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT,
  value_type TEXT NOT NULL DEFAULT 'STRING'
    CHECK(value_type IN ('STRING', 'NUMBER', 'BOOLEAN', 'JSON')),
  description TEXT,
  is_public INTEGER NOT NULL DEFAULT 0 CHECK(is_public IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS restaurant_settings (
  id TEXT PRIMARY KEY,
  restaurant_id TEXT NOT NULL,
  setting_key TEXT NOT NULL,
  setting_value TEXT,
  value_type TEXT NOT NULL DEFAULT 'STRING'
    CHECK(value_type IN ('STRING', 'NUMBER', 'BOOLEAN', 'JSON')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  UNIQUE (restaurant_id, setting_key),
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  restaurant_id TEXT,
  user_id TEXT,
  type TEXT NOT NULL DEFAULT 'INFO' CHECK(type IN ('INFO', 'WARNING', 'ERROR', 'SUCCESS')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read_at TEXT,
  created_at TEXT NOT NULL,
  expires_at TEXT,
  deleted_at TEXT,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS backups (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL CHECK(status IN ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED')),
  storage_provider TEXT,
  storage_key TEXT,
  file_size_bytes INTEGER CHECK(file_size_bytes IS NULL OR file_size_bytes >= 0),
  checksum TEXT,
  started_at TEXT NOT NULL,
  finished_at TEXT,
  error_message TEXT
);

CREATE TABLE IF NOT EXISTS support_tickets (
  id TEXT PRIMARY KEY,
  restaurant_id TEXT,
  opened_by_user_id TEXT,
  assigned_to_user_id TEXT,
  subject TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'OPEN'
    CHECK(status IN ('OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER', 'RESOLVED', 'CLOSED')),
  priority TEXT NOT NULL DEFAULT 'NORMAL' CHECK(priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  closed_at TEXT,
  deleted_at TEXT,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  FOREIGN KEY (opened_by_user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
  FOREIGN KEY (assigned_to_user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS support_messages (
  id TEXT PRIMARY KEY,
  ticket_id TEXT NOT NULL,
  user_id TEXT,
  message TEXT NOT NULL,
  is_internal INTEGER NOT NULL DEFAULT 0 CHECK(is_internal IN (0, 1)),
  created_at TEXT NOT NULL,
  deleted_at TEXT,
  FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS system_events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'INFO' CHECK(severity IN ('DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL')),
  source TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_restaurant_settings_restaurant ON restaurant_settings (restaurant_id);
CREATE INDEX IF NOT EXISTS idx_notifications_restaurant_created ON notifications (restaurant_id, created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications (user_id, read_at);
CREATE INDEX IF NOT EXISTS idx_backups_status ON backups (status);
CREATE INDEX IF NOT EXISTS idx_backups_started_at ON backups (started_at);
CREATE INDEX IF NOT EXISTS idx_support_tickets_restaurant ON support_tickets (restaurant_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets (status);
CREATE INDEX IF NOT EXISTS idx_support_messages_ticket ON support_messages (ticket_id);
CREATE INDEX IF NOT EXISTS idx_system_events_type_created ON system_events (event_type, created_at);
CREATE INDEX IF NOT EXISTS idx_system_events_severity_created ON system_events (severity, created_at);
