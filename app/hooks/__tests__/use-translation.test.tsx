import { describe, expect, test } from "bun:test"
import { createContentText } from "~/hooks/use-translation"

describe("英語の画面", () => {
  test("タイトルは英語の訳を出す", () => {
    expect(createContentText(true).workTitle("桜", "Cherry blossoms")).toBe("Cherry blossoms")
  })
  test("訳がない・訳に日本語が残るときは Untitled", () => {
    const t = createContentText(true)
    expect(t.workTitle("今日のぱんつ", "")).toBe("Untitled")
    expect(t.workTitle("そんな装備で", "そんな装備で")).toBe("Untitled")
    expect(t.workTitle("Sakura", "")).toBe("Sakura")
  })
  test("説明は空にする", () => {
    const t = createContentText(true)
    expect(t.text("説明です", null)).toBe("")
    expect(t.text("説明です", "Description")).toBe("Description")
  })
  test("訳がないタグは出さない", () => {
    const t = createContentText(true)
    expect(t.tag("オリジナル", null)).toBeNull()
    expect(t.tag("オリジナル", "Original")).toBe("Original")
    expect(t.tag("AIart", null)).toBe("AIart")
  })
})

describe("日本語の画面", () => {
  test("元の文のまま", () => {
    const t = createContentText(false)
    expect(t.workTitle("桜", "Cherry blossoms")).toBe("桜")
    expect(t.text("説明です", "Description")).toBe("説明です")
    expect(t.tag("オリジナル", "Original")).toBe("オリジナル")
  })
})
