import { expect, test } from "bun:test"
import { filterAiModels } from "~/routes/($lang)._main.new.image/utils/filter-ai-models"

const models = [
  { id: "3", name: "StableDiffusion" },
  { id: "130", name: "Krea 2" },
  { id: "125", name: "FLUX.2" },
  { id: "10", name: "CustomModel(その他)" },
]

test("空白を入れずに検索しても見つかる", () => {
  expect(filterAiModels(models, "Krea2").map((m) => m.name)).toEqual([
    "Krea 2",
  ])
})

test("記号を省いて検索しても見つかる", () => {
  expect(filterAiModels(models, "flux2").map((m) => m.name)).toEqual([
    "FLUX.2",
  ])
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
