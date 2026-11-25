import { describe, expect, test } from "bun:test"
import { libraryItemHref } from "~/components/model-library/model-library-items"
import { fromOfficialLora } from "~/components/model-library/model-library-utils"
import {
  findLoraDetail,
  listLoraDetails,
} from "~/lib/lora-details/lora-details.server"
import { officialLoraFamily } from "~/lib/user-models/lora-compat"

describe("lora-details", () => {
  test("紹介のある公式 LoRA はすべて SDXL 用として扱われる（SD1.5 のモデルに付けたときに警告が出る）", () => {
    const details = listLoraDetails()
    expect(details.length).toBeGreaterThan(0)
    for (const detail of details) {
      expect(officialLoraFamily(detail.name)).toBe("SDXL")
    }
  })

  test("名前は重ならず、作例・日英の紹介・出典がそろっている", () => {
    const details = listLoraDetails()
    expect(new Set(details.map((detail) => detail.name)).size).toBe(
      details.length,
    )
    for (const detail of details) {
      expect(detail.images.length).toBeGreaterThan(0)
      for (const url of detail.images) {
        expect(url.startsWith("https://assets.aipictors.com/loras/")).toBe(true)
      }
      expect(detail.source.url.startsWith("https://civitai.com/models/")).toBe(
        true,
      )
      for (const text of [detail.ja, detail.en]) {
        expect(text.displayName.length).toBeGreaterThan(0)
        expect(text.summary.length).toBeGreaterThan(0)
        expect(text.license.length).toBeGreaterThan(0)
      }
      expect(detail.weight.recommended).toBeGreaterThan(0)
    }
  })

  test("名前は大文字小文字と拡張子の違いを気にせず引ける", () => {
    expect(findLoraDetail("detail_tweaker_xl")?.name).toBe("detail_tweaker_xl")
    expect(findLoraDetail("Detail_Tweaker_XL.safetensors")?.name).toBe(
      "detail_tweaker_xl",
    )
    expect(findLoraDetail("flat1")).toBeNull()
    expect(findLoraDetail("")).toBeNull()
  })

  test("モデルライブラリの公式 LoRA は LoRA のページへリンクする", () => {
    const item = fromOfficialLora({
      id: "1",
      name: "detail_tweaker_xl",
      description: "",
      thumbnailImageURL: null,
    } as Parameters<typeof fromOfficialLora>[0])
    expect(libraryItemHref(item)).toBe("/models/lora/detail_tweaker_xl")
  })
})
