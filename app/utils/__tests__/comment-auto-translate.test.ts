import { describe, expect, test } from "bun:test"
import { shouldAutoTranslateComment } from "~/utils/comment-auto-translate"

describe("shouldAutoTranslateComment", () => {
  test("英語のページでは日本語を訳す", () => {
    expect(shouldAutoTranslateComment("かわいいですね", "en")).toBe(true)
    expect(shouldAutoTranslateComment("nice work", "en")).toBe(false)
  })

  test("日本語のページでは日本語以外の文を訳す", () => {
    expect(shouldAutoTranslateComment("nice work", "ja")).toBe(true)
    expect(shouldAutoTranslateComment("muy bonito", "ja")).toBe(true)
    expect(shouldAutoTranslateComment("かわいい", "ja")).toBe(false)
  })

  test("文字のないコメントは訳さない", () => {
    expect(shouldAutoTranslateComment("", "en")).toBe(false)
    expect(shouldAutoTranslateComment(null, "ja")).toBe(false)
    expect(shouldAutoTranslateComment("👍👍", "ja")).toBe(false)
    expect(shouldAutoTranslateComment("ok", "ja")).toBe(false)
  })
})
