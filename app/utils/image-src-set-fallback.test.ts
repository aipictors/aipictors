import { describe, expect, test } from "bun:test"
import {
  isSrcSetDisabled,
  markSrcSetFailed,
  toSettledImageState,
} from "~/utils/image-src-set-fallback"

const a = "https://example.com/a.webp"
const b = "https://example.com/b.webp"

describe("markSrcSetFailed", () => {
  test("失敗した画像だけ元の画像で出す", () => {
    const failed = markSrcSetFailed(new Set<string>(), a)
    expect(isSrcSetDisabled(failed, a)).toBe(true)
    expect(isSrcSetDisabled(failed, b)).toBe(false)
  })

  test("同じ画像を二度入れても作り直さない（描き直しを増やさない）", () => {
    const failed = markSrcSetFailed(new Set<string>(), a)
    expect(markSrcSetFailed(failed, a)).toBe(failed)
  })

  test("元の集合は変えない", () => {
    const first = new Set<string>()
    markSrcSetFailed(first, a)
    expect(first.has(a)).toBe(false)
  })
})

describe("toSettledImageState", () => {
  test("読み込み中は pending", () => {
    expect(toSettledImageState({ complete: false, naturalWidth: 0 })).toBe(
      "pending",
    )
  })
  test("中身があれば loaded", () => {
    expect(toSettledImageState({ complete: true, naturalWidth: 800 })).toBe(
      "loaded",
    )
  })
  test("complete でも幅 0（404 などで失敗）は failed", () => {
    expect(toSettledImageState({ complete: true, naturalWidth: 0 })).toBe(
      "failed",
    )
  })
})
