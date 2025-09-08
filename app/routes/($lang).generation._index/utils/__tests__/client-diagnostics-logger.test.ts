// filepath: app/routes/($lang).generation._index/utils/__tests__/client-diagnostics-logger.test.ts
import { expect, test, beforeEach } from "bun:test"
import {
  clearLogs,
  getLogs,
  logInfo,
  logWarn,
  logError,
} from "../client-diagnostics-logger"

const STORAGE_KEY = "aipictors:generation:logs"

beforeEach(() => {
  try {
    clearLogs()
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  } catch {}
})

test("ログ追加でlocalStorageへ保存される", () => {
  logInfo({ source: "Test", message: "hello" })
  const raw = window.localStorage.getItem(STORAGE_KEY)
  expect(raw).toBeTruthy()
  const data = JSON.parse(String(raw))
  expect(Array.isArray(data)).toBe(true)
  expect(data.length).toBe(1)
  expect(data[0].level).toBe("info")
})

test("getLogsはlocalStorageから同期して最新を返す", () => {
  const externalLog = {
    id: "x-1",
    timestamp: Date.now(),
    level: "warn",
    source: "External",
    message: "from-other-module",
    details: { token: "secret" },
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([externalLog]))

  const logs = getLogs()
  expect(logs.length).toBe(1)
  expect(logs[0].source).toBe("External")
  // マスキング済みであること
  expect(JSON.stringify(logs[0].details)).toContain("<redacted>")
})

test("イベント発火で購読者が更新される", async () => {
  let called = 0
  const handler = () => {
    called += 1
  }
  window.addEventListener("generation:logs-updated", handler)
  try {
    logWarn({ source: "Test", message: "warn" })
    logError({ source: "Test", message: "error" })
  } finally {
    window.removeEventListener("generation:logs-updated", handler)
  }
  expect(called).toBeGreaterThanOrEqual(2)
})

test("機密情報やURLのクエリはマスクされる", () => {
  const dataUrl =
    "data:image/png;base64," + btoa("x".repeat(64)) // 適当なBase64
  logInfo({
    source: "Test",
    message: "masking",
    details: {
      token: "super-secret",
      password: "p@ss",
      cookie: "abc",
      url: "https://example.com/path?q=1#hash",
      dataUrl,
      jwt: "aaa.bbb.ccc",
      longBase64:
        "Q".repeat(300), // Base64風長文
    },
  })

  const logs = getLogs()
  const json = JSON.stringify(logs[0].details)
  expect(json).toContain("<redacted>")
  expect(json).toContain("https://example.com/path")
  expect(json).not.toContain("?q=")
  expect(json).not.toContain("#hash")
  expect(json).toContain("<jwt:redacted>")
  expect(json).toMatch(/base64|length/i)
})

test("最大500件まで保持される", () => {
  for (let i = 0; i < 510; i += 1) {
    logInfo({ source: "Bulk", message: `no.${i}` })
  }
  const logs = getLogs()
  expect(logs.length).toBe(500)
  // 末尾が最新
  expect(logs[logs.length - 1].message).toBe("no.509")
})
