CREATE TABLE IF NOT EXISTS user_points_balance (
  user_id TEXT PRIMARY KEY,
  balance INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS user_points_ledger (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  delta INTEGER NOT NULL,
  kind TEXT NOT NULL,
  reason TEXT,
  stripe_event_id TEXT,
  stripe_session_id TEXT,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES user_points_balance(user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_points_ledger_user_created
ON user_points_ledger(user_id, created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_points_ledger_event
ON user_points_ledger(stripe_event_id)
WHERE stripe_event_id IS NOT NULL;
