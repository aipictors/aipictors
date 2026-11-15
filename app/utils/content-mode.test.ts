import { afterEach, describe, expect, test } from "bun:test"
import {
  CONTENT_MODE_INLINE_SCRIPT,
  readContentMode,
  subscribeContentMode,
  writeContentMode,
} from "~/utils/content-mode"

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
