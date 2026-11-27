import { describe, expect, test } from "bun:test"
import type { TSortableItem } from "~/components/drag/sortable-item"
import { getAutoMosaicConfirmPreviews } from "~/routes/($lang)._main.new.image/utils/auto-mosaic-confirm"

const mosaic = (isAuto: boolean, mask = "data:mask") => ({
  source: "data:source",
  mask,
  style: "mosaic" as const,
  strength: 1,
  isAuto,
})

describe("getAutoMosaicConfirmPreviews", () => {
  test("自動でかけたままの画像だけを、かけた後の画像で返す", () => {
    const items: TSortableItem[] = [
      { id: 1, content: "data:auto", mosaic: mosaic(true) },
      { id: 2, content: "data:manual", mosaic: mosaic(false) },
      { id: 3, content: "data:plain" },
      { id: 4, content: "data:plain2", mosaic: null },
    ]
    expect(getAutoMosaicConfirmPreviews(items)).toEqual(["data:auto"])
  })

  test("範囲が空・元の画像のままの画像は出さない", () => {
    const items: TSortableItem[] = [
      { id: 1, content: "data:x", mosaic: mosaic(true, "") },
      { id: 2, content: "data:source", mosaic: mosaic(true) },
      { id: 3, content: null, mosaic: mosaic(true) },
    ]
    expect(getAutoMosaicConfirmPreviews(items)).toEqual([])
  })
})
