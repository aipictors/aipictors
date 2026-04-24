export type PointLedgerKind =
  | "PURCHASE"
  | "GRANT"
  | "CONSUME"
  | "REFUND_REVOKE"

export type PointLedgerRow = {
  id: number
  delta: number
  kind: PointLedgerKind
  reason: string | null
  stripeEventId: string | null
  stripeSessionId: string | null
  createdAt: number
}

const schemaSql = [
  `CREATE TABLE IF NOT EXISTS user_points_balance (
    user_id TEXT PRIMARY KEY,
    balance INTEGER NOT NULL DEFAULT 0,
    updated_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS user_points_ledger (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    delta INTEGER NOT NULL,
    kind TEXT NOT NULL,
    reason TEXT,
    stripe_event_id TEXT,
    stripe_session_id TEXT,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user_points_balance(user_id)
  )`,
  `CREATE INDEX IF NOT EXISTS idx_user_points_ledger_user_created
   ON user_points_ledger(user_id, created_at DESC)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_user_points_ledger_event
   ON user_points_ledger(stripe_event_id)
   WHERE stripe_event_id IS NOT NULL`,
]

export const ensurePointsSchema = async (db: D1Database) => {
  for (const sql of schemaSql) {
    await db.exec(sql)
  }
}

export const getUserPointsSummary = async (props: {
  db: D1Database
  userId: string
  limit?: number
}) => {
  const limit = Math.max(1, Math.min(props.limit ?? 50, 100))

  const balanceRow = await props.db
    .prepare(`SELECT balance FROM user_points_balance WHERE user_id = ?`)
    .bind(props.userId)
    .first<{ balance: number }>()

  const ledgerRows = await props.db
    .prepare(
      `SELECT
        id,
        delta,
        kind,
        reason,
        stripe_event_id AS stripeEventId,
        stripe_session_id AS stripeSessionId,
        created_at AS createdAt
      FROM user_points_ledger
      WHERE user_id = ?
      ORDER BY id DESC
      LIMIT ?`,
    )
    .bind(props.userId, limit)
    .all<PointLedgerRow>()

  return {
    balance: balanceRow?.balance ?? 0,
    rows: ledgerRows.results ?? [],
  }
}

export const hasStripeEventProcessed = async (props: {
  db: D1Database
  stripeEventId: string
}) => {
  const found = await props.db
    .prepare(`SELECT id FROM user_points_ledger WHERE stripe_event_id = ? LIMIT 1`)
    .bind(props.stripeEventId)
    .first<{ id: number }>()

  return found !== null
}

export const addPointsTransaction = async (props: {
  db: D1Database
  userId: string
  delta: number
  kind: PointLedgerKind
  reason?: string | null
  stripeEventId?: string | null
  stripeSessionId?: string | null
}) => {
  const now = Math.floor(Date.now() / 1000)

  await props.db
    .prepare(
      `INSERT INTO user_points_balance(user_id, balance, updated_at)
       VALUES (?, 0, ?)
       ON CONFLICT(user_id) DO NOTHING`,
    )
    .bind(props.userId, now)
    .run()

  if (props.delta < 0) {
    const consumeResult = await props.db
      .prepare(
        `UPDATE user_points_balance
         SET balance = balance + ?, updated_at = ?
         WHERE user_id = ? AND balance >= ?`,
      )
      .bind(props.delta, now, props.userId, Math.abs(props.delta))
      .run()

    if ((consumeResult.meta.changes ?? 0) === 0) {
      return { ok: false as const, code: "INSUFFICIENT_POINTS" as const }
    }
  } else {
    await props.db
      .prepare(
        `UPDATE user_points_balance
         SET balance = balance + ?, updated_at = ?
         WHERE user_id = ?`,
      )
      .bind(props.delta, now, props.userId)
      .run()
  }

  await props.db
    .prepare(
      `INSERT INTO user_points_ledger(
        user_id,
        delta,
        kind,
        reason,
        stripe_event_id,
        stripe_session_id,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      props.userId,
      props.delta,
      props.kind,
      props.reason ?? null,
      props.stripeEventId ?? null,
      props.stripeSessionId ?? null,
      now,
    )
    .run()

  return { ok: true as const }
}
