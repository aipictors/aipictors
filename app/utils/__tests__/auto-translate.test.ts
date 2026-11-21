import { describe, expect, test } from "bun:test"
import {
  shouldAutoTranslate,
  translateAutomatically,
} from "~/utils/auto-translate"

describe("shouldAutoTranslate", () => {
  test("英語のページでは日本語を訳す", () => {
    expect(shouldAutoTranslate("かわいいですね", "en")).toBe(true)
    expect(shouldAutoTranslate("nice work", "en")).toBe(false)
  })

  test("日本語のページでは日本語以外の文を訳す", () => {
    expect(shouldAutoTranslate("nice work", "ja")).toBe(true)
    expect(shouldAutoTranslate("muy bonito", "ja")).toBe(true)
    expect(shouldAutoTranslate("かわいい", "ja")).toBe(false)
  })

  test("文字のないコメントは訳さない", () => {
    expect(shouldAutoTranslate("", "en")).toBe(false)
    expect(shouldAutoTranslate(null, "ja")).toBe(false)
    expect(shouldAutoTranslate("👍👍", "ja")).toBe(false)
    expect(shouldAutoTranslate("ok", "ja")).toBe(false)
  })
})

describe("translateAutomatically", () => {
  test("近いタイミングの文をまとめて /api/translate に送り、同じ文は 1 回だけ訳す", async () => {
    const bodies: { texts: string[]; target: string }[] = []
    const originalFetch = globalThis.fetch
    globalThis.fetch = (async (_url: string, init: RequestInit) => {
      const body = JSON.parse(String(init.body))
      bodies.push(body)
      return Response.json({
        data: {
          translations: body.texts.map((text: string) =>
            text === "失敗" ? null : `EN:${text}`,
          ),
        },
      })
    }) as typeof fetch
    try {
      const results = await Promise.all([
        translateAutomatically("こんにちは", "en"),
        translateAutomatically(" こんにちは ", "en"),
        translateAutomatically("失敗", "en"),
      ])
      expect(results).toEqual(["EN:こんにちは", "EN:こんにちは", ""])
      expect(bodies).toEqual([{ texts: ["こんにちは", "失敗"], target: "en" }])
    } finally {
      globalThis.fetch = originalFetch
    }
  })
})
