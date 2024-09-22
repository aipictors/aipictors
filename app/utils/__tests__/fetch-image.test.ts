import { describe, expect, test, jest } from "bun:test"
import { fetchImage } from "~/utils/fetch-image-object-url"

global.URL.createObjectURL = jest.fn() // URL.createObjectURLをモック

describe("fetchImage", () => {
  test("画像の取得が成功する", async () => {
    const mockBlob = new Blob(["dummy content"], { type: "image/jpeg" })
    const mockUrl = "blob:https://example.com/123456"

    global.fetch = jest.fn(() =>
      Promise.resolve({
        blob: () => Promise.resolve(mockBlob),
      } as Response),
    )

    global.URL.createObjectURL = jest.fn(() => mockUrl)

    const imageURL = "https://example.com/image.jpg"
    const result = await fetchImage(imageURL)

    expect(global.fetch).toHaveBeenCalledWith(imageURL, {
      mode: "cors",
      priority: "high",
    })
    expect(result).toBe(mockUrl)
  })

  test("画像の取得が失敗した場合、エラーメッセージをスローする", async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error("Fetch failed")))

    const imageURL = "https://example.com/image.jpg"

    await expect(fetchImage(imageURL)).rejects.toThrow("Fetch failed")
  })

  test("fetchが不明なエラーを返した場合のエラーメッセージ", async () => {
    global.fetch = jest.fn(() => Promise.reject("Unknown error"))

    const imageURL = "https://example.com/image.jpg"

    await expect(fetchImage(imageURL)).rejects.toThrow(
      "画像の取得に失敗しました",
    )
  })
})
