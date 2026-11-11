import { afterEach, describe, expect, mock, test } from "bun:test"
import { fetchMarkdownText } from "~/utils/fetch-markdown-text"

const originalFetch = globalThis.fetch

afterEach(() => {
  globalThis.fetch = originalFetch
})

describe("fetchMarkdownText", () => {
  test("ブラウザに残った古い本文を使わず、毎回確かめて取得する", async () => {
    const fetchMock = mock(async () => new Response("# 更新後の本文"))
    globalThis.fetch = fetchMock as unknown as typeof fetch

    const text = await fetchMarkdownText("https://text-files.aipictors.com/abc")

    expect(text).toBe("# 更新後の本文")
    expect(fetchMock).toHaveBeenCalledWith(
      "https://text-files.aipictors.com/abc",
      { cache: "no-cache" },
    )
  })
})
