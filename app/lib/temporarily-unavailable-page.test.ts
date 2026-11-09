import { describe, expect, test } from "bun:test"
import { createTemporarilyUnavailablePage } from "~/lib/temporarily-unavailable-page"

describe("createTemporarilyUnavailablePage", () => {
  test("503 で再訪の目安を返し、保存させない", async () => {
    const response = createTemporarilyUnavailablePage("/posts/1")
    expect(response.status).toBe(503)
    expect(response.headers.get("Retry-After")).toBe("30")
    expect(response.headers.get("Cache-Control")).toBe("no-store")
    expect(await response.text()).toContain("少し混み合っています")
  })

  test("英語のページは英語で出す", async () => {
    const response = createTemporarilyUnavailablePage("/en/posts/1")
    expect(await response.text()).toContain('lang="en"')
  })
})
