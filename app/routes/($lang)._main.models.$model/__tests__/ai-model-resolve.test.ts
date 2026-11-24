import { describe, expect, test } from "bun:test"
import {
  normalizeAiModelName,
  resolveAiModelParam,
} from "~/routes/($lang)._main.models.$model/ai-model-resolve"
import { findAiModelImageModels } from "~/routes/($lang)._main.models.$model/ai-model-image-models"

const imageModels = [
  { id: "1", modelName: "ProfiteroleMix", displayName: "ProfiteroleMix" },
  { id: "2", modelName: "ChromaFT_v2", displayName: "ChromaFTv2" },
  { id: "730", modelName: "", displayName: "Z-Image Turbo" },
  { id: "733", modelName: "", displayName: "MOSS Image" },
  { id: "734", modelName: "", displayName: "Jib Mix Moss Realistic V3" },
]

const aiModelNames = [
  "ProfiteroleMix",
  "ChromaFT_v2",
  "NovelAI",
  "z-image turbo",
  "MOSS-Image",
]

const resolve = (param: string) =>
  resolveAiModelParam({ param, imageModels, aiModelNames })

describe("normalizeAiModelName", () => {
  test("大文字小文字・空白・記号・拡張子・ハッシュを無視する", () => {
    expect(normalizeAiModelName("Z-Image Turbo")).toBe("zimageturbo")
    expect(normalizeAiModelName("z-image turbo")).toBe("zimageturbo")
    expect(normalizeAiModelName("MOSS-Image")).toBe(
      normalizeAiModelName("MOSS Image"),
    )
    expect(
      normalizeAiModelName("ProfiteroleMix.safetensors [e56958149c]"),
    ).toBe("profiterolemix")
  })
})

describe("resolveAiModelParam", () => {
  test("生成機の番号は作品のモデル名のページへ移す", () => {
    expect(resolve("1")).toEqual({ kind: "redirect", name: "ProfiteroleMix" })
    expect(resolve("2")).toEqual({ kind: "redirect", name: "ChromaFT_v2" })
  })

  test("表示名は作品のモデル名のページへ移す", () => {
    expect(resolve("ChromaFTv2")).toEqual({
      kind: "redirect",
      name: "ChromaFT_v2",
    })
  })

  test("作品のモデルが表示名と記号違いで登録されていればそこへ移す", () => {
    expect(resolve("730")).toEqual({ kind: "redirect", name: "z-image turbo" })
    expect(resolve("Z-Image Turbo")).toEqual({
      kind: "redirect",
      name: "z-image turbo",
    })
    expect(resolve("733")).toEqual({ kind: "redirect", name: "MOSS-Image" })
  })

  test("作品のモデルがまだ無い生成機のモデルは表示名のページで紹介を出す", () => {
    expect(resolve("734")).toEqual({
      kind: "redirect",
      name: "Jib Mix Moss Realistic V3",
    })
    expect(resolve("Jib Mix Moss Realistic V3")).toEqual({
      kind: "generator",
      imageModel: imageModels[4],
    })
  })

  test("大文字小文字違いの作品のモデル名は正しい名前へ移す", () => {
    expect(resolve("novelai")).toEqual({ kind: "redirect", name: "NovelAI" })
  })

  test("どのモデルでもなければ null（404）", () => {
    expect(resolve("999999")).toBeNull()
    expect(resolve("no-such-model")).toBeNull()
    expect(resolve(" ")).toBeNull()
  })
})

describe("findAiModelImageModels", () => {
  const models = imageModels.map((item) => ({
    ...item,
    explanation: "",
    type: "SDXL",
    style: "ILLUSTRATION" as const,
    thumbnailImageURL: null,
  }))

  test("作品のモデル名が記号違いでも生成機のモデルを見つける", () => {
    const result = findAiModelImageModels(
      models,
      { name: "z-image turbo", generationModelId: null },
      12,
    )
    expect(result.current?.id).toBe("730")
  })

  test("似ているモデルに作品のまだ無い生成機のモデルも入れる", () => {
    const result = findAiModelImageModels(
      models,
      { name: "ProfiteroleMix", generationModelId: "1" },
      12,
    )
    expect(result.related.map((item) => item.id)).toContain("734")
  })
})
