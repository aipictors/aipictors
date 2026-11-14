import { describe, expect, test } from "bun:test"
import { readFileSync } from "node:fs"

describe("自分の作品の検索欄", () => {
  test("日本語の変換中は検索しない", () => {
    const source = readFileSync(
      "app/routes/($lang).my._index/components/works-settings.tsx",
      "utf8",
    )

    // iPhone の Safari は変換中も入力値が変わり、「うちゅ」のような途中の文字で検索されていた
    expect(source).toContain("onCompositionStart={() => setIsComposing(true)}")
    expect(source).toContain("if (isComposing) return")
  })
})
