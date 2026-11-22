import { describe, expect, test } from "bun:test"
import { dedupeModelImages } from "~/utils/dedupe-model-images"

const civitai = (id: string, width: number) =>
  `https://image.civitai.com/x/${id}/width=${width}/${id}.jpeg`

describe("dedupeModelImages", () => {
  test("同じ画像の大きさ違いは大きい方を 1 枚だけ、最初の位置に残す", () => {
    expect(
      dedupeModelImages([
        civitai("a", 450),
        civitai("a", 1024),
        civitai("b", 1024),
      ]),
    ).toEqual([civitai("a", 1024), civitai("b", 1024)])
  })

  test("同じ URL は 1 枚、Civitai 以外の URL はそのまま", () => {
    expect(
      dedupeModelImages([
        "https://example.com/1.webp",
        "https://example.com/1.webp",
        "https://example.com/2.webp",
      ]),
    ).toEqual(["https://example.com/1.webp", "https://example.com/2.webp"])
  })
})
