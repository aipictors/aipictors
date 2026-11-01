import { describe, expect, test } from "bun:test"
import {
  formatExpiry,
  getLedgerLabel,
  getTodayLedgerStats,
  groupLedgerByDay,
  type LedgerItem,
  matchesLedgerFilter,
} from "~/routes/($lang).settings.points/utils/coin-ledger"

const t = (ja: string) => ja

// 2026-11-02 12:00 JST
const NOW = Date.UTC(2026, 10, 2, 3, 0, 0) / 1000

const row = (props: Partial<LedgerItem>): LedgerItem => ({
  id: 1,
  coinType: "FREE",
  delta: -10,
  kind: "CONSUME",
  reason: "image-generation:txt2img",
  source: "task:abc",
  createdAt: NOW,
  ...props,
})

describe("getLedgerLabel", () => {
  test("内部の識別子を見せない", () => {
    expect(getLedgerLabel(row({}), t)).toBe("画像生成")
    expect(
      getLedgerLabel(row({ reason: "image-generation:text_to_image" }), t),
    ).toBe("画像生成")
    expect(
      getLedgerLabel(row({ reason: "image-generation:reserved:txt2img" }), t),
    ).toBe("画像生成（予約）")
    expect(
      getLedgerLabel(
        row({
          reason: "image-generation:cancel-refund",
          kind: "GRANT",
          delta: 10,
        }),
        t,
      ),
    ).toBe("生成キャンセルの返却")
    expect(
      getLedgerLabel(row({ reason: "coin support", source: "support" }), t),
    ).toBe("ユーザーを推した")
    expect(getLedgerLabel(row({ reason: "work-comment-support" }), t)).toBe(
      "コメントで推した",
    )
    expect(
      getLedgerLabel(
        row({ reason: "premium-coin-purchase", kind: "GRANT", delta: 100 }),
        t,
      ),
    ).toBe("プレミアムコインを購入")
    expect(
      getLedgerLabel(
        row({
          reason: "LITE daily generation coin grant",
          kind: "INITIAL_GRANT",
          delta: 100,
        }),
        t,
      ),
    ).toBe("毎日のコイン（LITE）")
    expect(
      getLedgerLabel(
        row({ reason: "Daily coin expiration", kind: "EXPIRE" }),
        t,
      ),
    ).toBe("有効期限切れ")
  })

  test("日本語の理由はそのまま出し、知らない英語の識別子は出さない", () => {
    expect(
      getLedgerLabel(
        row({ reason: "実績「レベル30」を達成", kind: "GRANT", delta: 50 }),
        t,
      ),
    ).toBe("実績「レベル30」を達成")
    expect(getLedgerLabel(row({ reason: "some-internal-code" }), t)).toBe(
      "コインを使用",
    )
    expect(
      getLedgerLabel(
        row({ reason: "some-internal-code", kind: "GRANT", delta: 5 }),
        t,
      ),
    ).toBe("コインを受け取り")
  })
})

describe("formatExpiry", () => {
  test("00:00 ちょうどは前の日の 24:00 と出す", () => {
    // 2026-11-03 00:00 JST
    expect(formatExpiry(Date.UTC(2026, 10, 2, 15, 0, 0) / 1000, NOW, t)).toBe(
      "今日 24:00",
    )
    // 2026-11-04 00:00 JST
    expect(formatExpiry(Date.UTC(2026, 10, 3, 15, 0, 0) / 1000, NOW, t)).toBe(
      "明日 24:00",
    )
    // 2026-12-01 00:00 JST
    expect(formatExpiry(Date.UTC(2026, 10, 30, 15, 0, 0) / 1000, NOW, t)).toBe(
      "11/30 24:00",
    )
  })

  test("来年以降は年をつける", () => {
    expect(formatExpiry(Date.UTC(2027, 0, 31, 3, 5, 0) / 1000, NOW, t)).toBe(
      "2027/1/31 12:05",
    )
  })
})

describe("groupLedgerByDay", () => {
  test("同じ内容が続く行をまとめ、合計と時間の幅を持つ", () => {
    const days = groupLedgerByDay(
      [
        row({ id: 3, createdAt: NOW }),
        row({ id: 2, createdAt: NOW - 60 }),
        row({ id: 1, createdAt: NOW - 120 }),
      ],
      t,
    )

    expect(days).toHaveLength(1)
    expect(days[0].groups).toHaveLength(1)
    expect(days[0].groups[0].count).toBe(3)
    expect(days[0].groups[0].delta).toBe(-30)
    expect(days[0].groups[0].lastAt).toBe(NOW)
    expect(days[0].groups[0].firstAt).toBe(NOW - 120)
  })

  test("間に別の内容が入ったり、日付やコインの種類が違えばまとめない", () => {
    const days = groupLedgerByDay(
      [
        row({ id: 5, createdAt: NOW }),
        row({
          id: 4,
          createdAt: NOW - 60,
          kind: "GRANT",
          delta: 100,
          reason: "FREE daily generation coin grant",
        }),
        row({ id: 3, createdAt: NOW - 120 }),
        row({ id: 2, createdAt: NOW - 180, coinType: "PREMIUM" }),
        row({ id: 1, createdAt: NOW - 24 * 60 * 60 }),
      ],
      t,
    )

    expect(days).toHaveLength(2)
    expect(days[0].groups).toHaveLength(4)
    expect(days[1].groups).toHaveLength(1)
  })
})

describe("getTodayLedgerStats", () => {
  test("今日の分だけ、プレミアムも含めて数える", () => {
    const stats = getTodayLedgerStats(
      [
        row({ id: 1 }),
        row({ id: 2, coinType: "PREMIUM", delta: -5 }),
        row({ id: 3, kind: "GRANT", delta: 100 }),
        row({ id: 4, kind: "EXPIRE", delta: -40 }),
        row({ id: 5, createdAt: NOW - 24 * 60 * 60 }),
      ],
      NOW,
    )

    expect(stats).toEqual({ received: 100, used: 15, expired: 40 })
  })
})

describe("matchesLedgerFilter", () => {
  test("種類ごとに分ける", () => {
    expect(matchesLedgerFilter(row({}), "used")).toBe(true)
    expect(matchesLedgerFilter(row({}), "received")).toBe(false)
    expect(
      matchesLedgerFilter(
        row({ kind: "INITIAL_GRANT", delta: 100 }),
        "received",
      ),
    ).toBe(true)
    expect(matchesLedgerFilter(row({ kind: "EXPIRE" }), "expired")).toBe(true)
    expect(matchesLedgerFilter(row({ kind: "EXPIRE" }), "all")).toBe(true)
  })
})
