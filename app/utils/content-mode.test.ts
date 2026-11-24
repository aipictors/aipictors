import { afterEach, describe, expect, test } from "bun:test"
import {
  CONTENT_MODE_INLINE_SCRIPT,
  isR18ModeSwitchPath,
  readContentMode,
  subscribeContentMode,
  writeContentMode,
} from "~/utils/content-mode"

describe("R18 に切り替えたと覚えるページ（isR18ModeSwitchPath）", () => {
  test("R18 の一覧・トップは覚える", () => {
    expect(isR18ModeSwitchPath("/r")).toBe(true)
    expect(isR18ModeSwitchPath("/r/")).toBe(true)
    expect(isR18ModeSwitchPath("/r/users/foo")).toBe(true)
    expect(isR18ModeSwitchPath("/r/posts/2d")).toBe(true)
    expect(isR18ModeSwitchPath("/en/r/rankings")).toBe(true)
  })

  test("個別の作品・小説・コラムは覚えない（サーバーが年齢区分で振り分けただけ）", () => {
    expect(isR18ModeSwitchPath("/r/posts/123456")).toBe(false)
    expect(isR18ModeSwitchPath("/r/posts/123456/")).toBe(false)
    expect(isR18ModeSwitchPath("/r/novels/123456")).toBe(false)
    expect(isR18ModeSwitchPath("/r/notes/123456")).toBe(false)
    expect(isR18ModeSwitchPath("/en/r/posts/123456")).toBe(false)
  })

  test("全年齢のページは覚えない", () => {
    expect(isR18ModeSwitchPath("/")).toBe(false)
    expect(isR18ModeSwitchPath("/posts/123456")).toBe(false)
    expect(isR18ModeSwitchPath("/requests")).toBe(false)
  })
})

afterEach(() => {
  localStorage.clear()
  delete document.documentElement.dataset.aipMode
})

describe("ヘッダーの切り替えの描画前の印（data-aip-mode）", () => {
  test("head のスクリプトは覚えているモードを書く", () => {
    new Function(CONTENT_MODE_INLINE_SCRIPT)()
    expect(document.documentElement.dataset.aipMode).toBe("all")

    localStorage.setItem("aipictors.contentMode", "r18")
    new Function(CONTENT_MODE_INLINE_SCRIPT)()
    expect(document.documentElement.dataset.aipMode).toBe("r18")
  })

  test("切り替えると印も変わる", () => {
    writeContentMode("r18")
    expect(readContentMode()).toBe("r18")
    expect(document.documentElement.dataset.aipMode).toBe("r18")

    writeContentMode("all")
    expect(document.documentElement.dataset.aipMode).toBe("all")
  })

  test("ほかのタブで切り替えたときも印を合わせる", () => {
    let calls = 0
    const unsubscribe = subscribeContentMode(() => {
      calls += 1
    })
    localStorage.setItem("aipictors.contentMode", "r18")
    window.dispatchEvent(new Event("storage"))
    expect(document.documentElement.dataset.aipMode).toBe("r18")
    expect(calls).toBe(1)
    unsubscribe()
  })
})
