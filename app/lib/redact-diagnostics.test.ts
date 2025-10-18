// filepath: app/lib/redact-diagnostics.test.ts
import { expect, test } from "bun:test"
import { redactDiagnostics } from "./redact-diagnostics"

// ルール: testのタイトルは日本語

test("文字列: data URLは長さのみ残す", () => {
  const input = `data:image/png;base64,${"a".repeat(300)}`
  const out = redactDiagnostics(input)
  expect(typeof out).toBe("string")
  expect(String(out)).toContain("<redacted length=300>")
})

test("文字列: JWTらしき文字列はマスク", () => {
  const input = "aaa.bbb.ccc"
  const out = redactDiagnostics(input)
  expect(out).toBe("<jwt:redacted>")
})

test("文字列: 長いBase64風は短縮", () => {
  const input = "A".repeat(260)
  const out = redactDiagnostics(input)
  expect(typeof out).toBe("string")
  expect(String(out)).toContain("<base64:redacted length=")
})

test("文字列: メールローカル部をマスク", () => {
  const input = "user.name@example.com"
  const out = redactDiagnostics(input)
  expect(out).toBe("u***@example.com")
})

test("URL: クエリとハッシュを除去", () => {
  const input = "https://example.com/path?a=1#hash"
  const out = redactDiagnostics(input)
  expect(out).toBe("https://example.com/path")
})

test("オブジェクト: 機密キーはマスク", () => {
  const input = { token: "abc", password: "xyz", Cookie: "aaa=1", keep: "ok" }
  const out = redactDiagnostics(input) as Record<string, unknown>
  expect(out.token).toBe("<redacted>")
  expect(out.password).toBe("<redacted>")
  expect(out.Cookie).toBe("<redacted>")
  expect(out.keep).toBe("ok")
})

test("配列: ネストも再帰マスク", () => {
  const input = [{ secret: "foo" }, "data:image/png;base64,aaaaa"]
  const out = redactDiagnostics(input) as unknown[]
  expect((out[0] as Record<string, unknown>).secret).toBe("<redacted>")
  expect(String(out[1])).toContain("<redacted length=")
})
