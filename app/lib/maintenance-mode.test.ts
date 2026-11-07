import {
  createSiteMaintenanceHtml,
  formatMaintenanceEndsAt,
  getMaintenanceRetryAfter,
  hasMaintenanceBypass,
  parseMaintenanceFlag,
  readMaintenanceFlag,
} from "./maintenance-mode"

const kvOf = (values: Record<string, string>) => {
  let reads = 0
  return {
    env: {
      PAGE_CACHE: {
        get: async (key: string) => {
          reads++
          return values[key] ?? null
        },
      },
    },
    reads: () => reads,
  }
}

test("enabled が true のときだけ有効", () => {
  expect(parseMaintenanceFlag(null).enabled).toBe(false)
  expect(parseMaintenanceFlag("not json").enabled).toBe(false)
  expect(parseMaintenanceFlag('{"enabled":false}').enabled).toBe(false)
  expect(parseMaintenanceFlag('{"enabled":"true"}').enabled).toBe(false)
  const flag = parseMaintenanceFlag(
    '{"enabled":true,"endsAt":"2026-11-15T03:00:00+09:00","message":" 移行中 ","bypassToken":"abc"}',
  )
  expect(flag).toEqual({
    enabled: true,
    endsAt: "2026-11-15T03:00:00+09:00",
    message: "移行中",
    bypassToken: "abc",
  })
  expect(parseMaintenanceFlag('{"enabled":true,"endsAt":"x"}').endsAt).toBe(
    null,
  )
})

test("KV はメモリに置いた値を使い回す", async () => {
  const kv = kvOf({ "test:a": '{"enabled":true}' })
  expect((await readMaintenanceFlag(kv.env, "test:a")).enabled).toBe(true)
  expect((await readMaintenanceFlag(kv.env, "test:a")).enabled).toBe(true)
  expect(kv.reads()).toBe(1)
  expect((await readMaintenanceFlag(undefined, "test:none")).enabled).toBe(
    false,
  )
})

test("確認用 cookie は bypassToken と同じときだけ通す", () => {
  const flag = parseMaintenanceFlag('{"enabled":true,"bypassToken":"t0k"}')
  // bun の Request は cookie ヘッダーを落とすので、ヘッダーだけの形で渡す
  const req = (cookie: string) =>
    ({ headers: new Headers({ cookie }) }) as Request
  expect(
    hasMaintenanceBypass(req("a=1; aip_maintenance_bypass=t0k"), flag),
  ).toBe(true)
  expect(hasMaintenanceBypass(req("aip_maintenance_bypass=bad"), flag)).toBe(
    false,
  )
  expect(
    hasMaintenanceBypass(
      req("aip_maintenance_bypass=t0k"),
      parseMaintenanceFlag('{"enabled":true}'),
    ),
  ).toBe(false)
})

test("終了予定は日本時間、Retry-After は 1 分〜1 日", () => {
  expect(formatMaintenanceEndsAt("2026-11-14T18:00:00Z")).toContain("03:00")
  expect(formatMaintenanceEndsAt(null)).toBe(null)
  const flag = parseMaintenanceFlag(
    JSON.stringify({
      enabled: true,
      endsAt: new Date(Date.now() + 3_600_000).toISOString(),
    }),
  )
  const retryAfter = getMaintenanceRetryAfter(flag)
  expect(retryAfter).toBeGreaterThan(3_500)
  expect(retryAfter).toBeLessThanOrEqual(3_600)
  expect(
    getMaintenanceRetryAfter(parseMaintenanceFlag('{"enabled":true}')),
  ).toBe(600)
})

test("メンテナンス画面は文言を出し、HTML は逃がす", () => {
  const html = createSiteMaintenanceHtml(
    parseMaintenanceFlag(
      '{"enabled":true,"endsAt":"2026-11-15T03:00:00+09:00","message":"<b>DB 移行</b>","bypassToken":"secret"}',
    ),
  )
  expect(html).toContain("<title>メンテナンス中 | Aipictors</title>")
  expect(html).toContain("ただいまメンテナンス中です。")
  expect(html).toContain("終了予定: 11/15(日) 03:00")
  expect(html).toContain("&lt;b&gt;DB 移行&lt;/b&gt;")
  expect(html).toContain('name="robots" content="noindex')
  expect(html).not.toContain("secret")
})
