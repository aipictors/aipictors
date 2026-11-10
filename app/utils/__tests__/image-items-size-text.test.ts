import { describe, expect, test } from "bun:test"
import {
  getDataUrlByteLength,
  getImageItemsSizeText,
} from "~/utils/image-items-size-text"

const toDataUrl = (byteLength: number) =>
  `data:image/webp;base64,${Buffer.alloc(byteLength).toString("base64")}`

describe("getDataUrlByteLength", () => {
  test("base64 の文字数ではなく元のバイト数を返す", () => {
    expect(getDataUrlByteLength(toDataUrl(1024))).toBe(1024)
    expect(getDataUrlByteLength(toDataUrl(1025))).toBe(1025)
    expect(getDataUrlByteLength(toDataUrl(1026))).toBe(1026)
  })

  test("URL は大きさが分からない", () => {
    expect(getDataUrlByteLength("https://example.com/a.webp")).toBeNull()
  })
})

describe("getImageItemsSizeText", () => {
  test("追加した画像の合計を出す", () => {
    expect(getImageItemsSizeText([toDataUrl(1024), toDataUrl(1024)])).toBe(
      "2.00 KB",
    )
    expect(getImageItemsSizeText([toDataUrl(1024 * 1024)])).toBe("1.00 MB")
  })

  test("投稿済みの画像が混ざっていれば出さない", () => {
    expect(
      getImageItemsSizeText(["https://example.com/a.webp", toDataUrl(1024)]),
    ).toBeNull()
  })

  test("空の項目は数えない", () => {
    expect(getImageItemsSizeText(["", null, toDataUrl(1024)])).toBe("1.00 KB")
  })
})
