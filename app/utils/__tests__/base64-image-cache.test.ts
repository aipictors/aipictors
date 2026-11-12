import { describe, expect, test } from "bun:test"
import {
  clearCachedDataUrls,
  getOrSetCachedDataUrl,
} from "~/utils/base64-image-cache"

const makeDataUrl = (length: number) =>
  `data:image/webp;base64,${"A".repeat(length)}`

describe("base64-image-cache", () => {
  test("同じキーなら変換は 1 回だけ", async () => {
    clearCachedDataUrls()
    let calls = 0
    const factory = async () => {
      calls += 1
      return makeDataUrl(10)
    }

    const first = await getOrSetCachedDataUrl("a", factory)
    const second = await getOrSetCachedDataUrl("a", factory)

    expect(first).toBe(second)
    expect(calls).toBe(1)
  })

  test("失敗したら覚えないので、もう一度試せる", async () => {
    clearCachedDataUrls()
    let calls = 0
    const factory = async () => {
      calls += 1
      if (calls === 1) throw new Error("failed")
      return makeDataUrl(10)
    }

    await expect(getOrSetCachedDataUrl("b", factory)).rejects.toThrow("failed")
    expect(await getOrSetCachedDataUrl("b", factory)).toBe(makeDataUrl(10))
    expect(calls).toBe(2)
  })

  test("合計が上限を超えたら古いものから捨てる（スマートフォンで落ちないように）", async () => {
    clearCachedDataUrls()
    const big = 13 * 1024 * 1024
    let calls = 0
    const factory = async () => {
      calls += 1
      return makeDataUrl(big)
    }

    await getOrSetCachedDataUrl("1枚目", factory)
    await getOrSetCachedDataUrl("2枚目", factory)
    expect(calls).toBe(2)

    // 1 枚目は捨てられているので、もう一度読み込む
    await getOrSetCachedDataUrl("1枚目", factory)
    expect(calls).toBe(3)

    clearCachedDataUrls()
  })
})
