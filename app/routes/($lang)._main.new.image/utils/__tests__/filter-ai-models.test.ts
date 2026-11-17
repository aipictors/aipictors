import { expect, test } from "bun:test"
import {
  canAddAiModel,
  filterAiModels,
} from "~/routes/($lang)._main.new.image/utils/filter-ai-models"

const models = [
  { id: "3", name: "StableDiffusion" },
  { id: "130", name: "Krea 2" },
  { id: "125", name: "FLUX.2" },
  { id: "10", name: "CustomModel(その他)" },
]

test("空白を入れずに検索しても見つかる", () => {
  expect(filterAiModels(models, "Krea2").map((m) => m.name)).toEqual(["Krea 2"])
})

test("記号を省いて検索しても見つかる", () => {
  expect(filterAiModels(models, "flux2").map((m) => m.name)).toEqual(["FLUX.2"])
})

test("検索語が空なら名前順に全件を返し、元の配列は並べ替えない", () => {
  expect(filterAiModels(models, "").map((m) => m.name)).toEqual([
    "CustomModel(その他)",
    "FLUX.2",
    "Krea 2",
    "StableDiffusion",
  ])
  expect(models[0].name).toBe("StableDiffusion")
})

test("全角で入れても見つかる", () => {
  expect(filterAiModels(models, "ＫＲＥＡ２").map((m) => m.name)).toEqual([
    "Krea 2",
  ])
})

test("表記ゆれで同じ名前のモデルがあれば足せない", () => {
  expect(canAddAiModel(models, "krea-2")).toBe(false)
  expect(canAddAiModel(models, " Krea2 ")).toBe(false)
  expect(canAddAiModel(models, "flux 2")).toBe(false)
})

test("一覧にない名前は足せる。空・記号だけは足せない", () => {
  expect(canAddAiModel(models, "Krea 3")).toBe(true)
  expect(canAddAiModel(models, "Krea")).toBe(true)
  expect(canAddAiModel(models, "")).toBe(false)
  expect(canAddAiModel(models, " - . ")).toBe(false)
})
