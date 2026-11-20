import { expect, jest, test } from "bun:test"
import {
  createBase64FromImageURL,
  isRetryableImageFetch,
  toRetryImageUrl,
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

test("やり直しのときだけ URL を変える", () => {
  expect(toRetryImageUrl("https://example.com/download?url=a", 0)).toBe(
    "https://example.com/download?url=a",
  )
  expect(toRetryImageUrl("https://example.com/download?url=a", 1)).toBe(
    "https://example.com/download?url=a&retry=1",
  )
  expect(toRetryImageUrl("https://example.com/image.png", 1)).toBe(
    "https://example.com/image.png?retry=1",
  )
})

test("毎回ブラウザの覚えている応答を使わずに取りに行く", async () => {
  const options: RequestInit[] = []
  global.fetch = jest.fn((_url: unknown, init: RequestInit) => {
    options.push(init)
    return Promise.resolve(toResponse(200))
  }) as unknown as typeof fetch

  await createBase64FromImageURL("https://files.aipictors.com/no-store.png")

  expect(options[0]?.cache).toBe("no-store")
})

test("1 回目が通信エラーでも、やり直して読み込める", async () => {
  let calls = 0
  const urls: string[] = []
  global.fetch = jest.fn((url: unknown) => {
    calls += 1
    urls.push(String(url))
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
  // 2 回目は別の URL として取りに行く
  expect(urls[1]).toContain("retry=1")
  expect(urls[0]).not.toContain("retry=")
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
