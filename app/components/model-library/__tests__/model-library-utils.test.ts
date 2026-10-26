import { describe, expect, test } from "bun:test"
import { defaultModelLibraryFilters } from "~/components/model-library/model-library-types"
import {
  filterLibraryItems,
  fromOfficialCheckpoint,
  fromOfficialLora,
  fromUserModel,
  officialBaseModel,
} from "~/components/model-library/model-library-utils"
import type { UserModel } from "~/lib/user-models/types"

const userModel = (patch: Partial<UserModel>): UserModel => ({
  id: "a",
  userId: "me",
  kind: "LORA",
  name: "水彩タッチ",
  description: "",
  baseModel: "ILLUSTRIOUS",
  triggerWords: "watercolor",
  recommendedWeight: 0.8,
  rating: "G",
  tags: ["水彩"],
  thumbnailUrl: null,
  sampleImageUrls: [],
  sha256: "x",
  sizeBytes: 100,
  status: "READY",
  useCount: 10,
  lastUsedAt: null,
  createdAt: 1,
  updatedAt: 1,
  ...patch,
})

describe("officialBaseModel", () => {
  test("SD1 は SD1.5、SDXL は名前から系統を判定する", () => {
    expect(officialBaseModel({ type: "SD1", name: "kimix" })).toBe("SD1.5")
    expect(officialBaseModel({ type: "SDXL", name: "ponyDiffusionV6" })).toBe(
      "PONY",
    )
    expect(officialBaseModel({ type: "SDXL", name: "illustriousXL" })).toBe(
      "ILLUSTRIOUS",
    )
    expect(officialBaseModel({ type: "SDXL", name: "animagine" })).toBe("SDXL")
    expect(officialBaseModel({ type: "FLUX", name: "flux.1 pro" })).toBeNull()
  })
})

describe("filterLibraryItems", () => {
  const items = [
    fromOfficialCheckpoint(
      {
        id: "1",
        name: "kimix",
        displayName: "kimix",
        type: "SD1",
        thumbnailImageURL: null,
        prompts: [],
      },
      [1],
    ),
    fromOfficialLora({
      id: "2",
      name: "flat1",
      description: "フラットな塗り",
      thumbnailImageURL: null,
    }),
    fromUserModel(userModel({ id: "a", useCount: 10 }), "me"),
    fromUserModel(
      userModel({
        id: "b",
        kind: "CHECKPOINT",
        name: "Anime XL",
        baseModel: "SDXL",
        tags: [],
        triggerWords: "",
        useCount: 50,
        updatedAt: 5,
      }),
      "me",
    ),
  ]

  test("種類とベースモデルで絞り込む", () => {
    const loras = filterLibraryItems(items, {
      ...defaultModelLibraryFilters,
      kind: "LORA",
    })
    expect(loras.map((item) => item.key)).toEqual([
      "user:a",
      "official-lora:flat1",
    ])
    const sd15 = filterLibraryItems(items, {
      ...defaultModelLibraryFilters,
      baseModel: "SD1.5",
    })
    expect(sd15.map((item) => item.key)).toEqual(["official-checkpoint:1"])
  })

  test("名前・説明・タグ・トリガーワードで検索する", () => {
    const search = (q: string) =>
      filterLibraryItems(items, { ...defaultModelLibraryFilters, q }).map(
        (item) => item.key,
      )
    expect(search("フラット")).toEqual(["official-lora:flat1"])
    expect(search("watercolor")).toEqual(["user:a"])
    expect(search("水彩")).toEqual(["user:a"])
  })

  test("人気順・新着順・名前順に並べ替える", () => {
    const keys = (sort: "popular" | "new" | "name") =>
      filterLibraryItems(items, { ...defaultModelLibraryFilters, sort }).map(
        (item) => item.key,
      )
    expect(keys("popular")[0]).toBe("user:b")
    expect(keys("new")[0]).toBe("user:b")
    expect(keys("name")).toEqual([
      "user:b",
      "official-lora:flat1",
      "official-checkpoint:1",
      "user:a",
    ])
  })

  test("自分のモデルとお気に入りを判定する", () => {
    expect(items[0].isFavorite).toBe(true)
    expect(items[2].isOwn).toBe(true)
    expect(fromUserModel(userModel({}), "other").isOwn).toBe(false)
  })
})
