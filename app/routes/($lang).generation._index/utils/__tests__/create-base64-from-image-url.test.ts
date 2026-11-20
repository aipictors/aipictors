import { expect, jest, test } from "bun:test"
import {
  createBase64FromImageURL,
  isRetryableImageFetch,
} from "~/routes/($lang).generation._index/utils/create-base64-from-image-url"

const toResponse = (status: number) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    blob: () => Promise.resolve(new Blob(["dummy"], { type: "image/png" })),
  }) as unknown as Response

test("通信の切断とサーバー側のエラーはやり直す", () => {
  expect(isRetryableImageFetch({ error: new TypeError("Load failed") })).toBe(
    true,
  )
  expect(isRetryableImageFetch({ status: 500 })).toBe(true)
  expect(isRetryableImageFetch({ status: 429 })).toBe(true)
  expect(isRetryableImageFetch({ status: 404 })).toBe(false)
  expect(isRetryableImageFetch({ status: 200 })).toBe(false)
})

test("1 回目が通信エラーでも、やり直して読み込める", async () => {
  let calls = 0
  global.fetch = jest.fn(() => {
    calls += 1
    if (calls === 1) {
      return Promise.reject(new TypeError("Load failed"))
    }
    return Promise.resolve(toResponse(200))
  }) as unknown as typeof fetch

  const dataUrl = await createBase64FromImageURL(
    "https://files.aipictors.com/retry-once.png",
  )

  expect(calls).toBe(2)
  expect(dataUrl.startsWith("data:")).toBe(true)
})

test("見つからない画像はやり直さずに終わる", async () => {
  let calls = 0
  global.fetch = jest.fn(() => {
    calls += 1
    return Promise.resolve(toResponse(404))
  }) as unknown as typeof fetch

  await expect(
    createBase64FromImageURL("https://files.aipictors.com/missing.png"),
  ).rejects.toThrow("(404)")
  expect(calls).toBe(1)
})

test("2 回とも失敗したら読み込めなかったことにする", async () => {
  let calls = 0
  global.fetch = jest.fn(() => {
    calls += 1
    return Promise.reject(new TypeError("Load failed"))
  }) as unknown as typeof fetch

  await expect(
    createBase64FromImageURL("https://files.aipictors.com/always-fails.png"),
  ).rejects.toThrow("Load failed")
  expect(calls).toBe(2)
})
