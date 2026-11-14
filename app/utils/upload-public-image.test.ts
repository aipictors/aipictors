import { describe, expect, test } from "bun:test"
import {
  isRetryableUploadError,
  toImageUploadTimeoutMs,
} from "~/utils/upload-public-image"

describe("画像のアップロードの待ち時間", () => {
  test("小さい画像はこれまでどおり 45 秒ほど", () => {
    expect(toImageUploadTimeoutMs(100_000)).toBeLessThan(50_000)
  })

  test("大きい画像は遅い回線でも送り切れるだけ待つ", () => {
    // 5MB の PNG をモバイル通信で送ると 45 秒では足りなかった
    expect(toImageUploadTimeoutMs(5_000_000)).toBeGreaterThan(150_000)
  })

  test("タイムアウトと通信の切断だけをもう一度送る", () => {
    expect(isRetryableUploadError(new DOMException("x", "AbortError"))).toBe(
      true,
    )
    expect(isRetryableUploadError(new TypeError("Load failed"))).toBe(true)
    expect(isRetryableUploadError(new Error("画像のアップロードに失敗"))).toBe(
      false,
    )
  })
})
