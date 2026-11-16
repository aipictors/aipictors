import { describe, expect, test } from "bun:test"
import { toWorkPromotionSlotState } from "~/routes/($lang)._main.posts.$post._index/utils/work-promotion-slot"

describe("toWorkPromotionSlotState", () => {
  const active = [{ slot: "GENERAL" as const, workId: "1", endsAt: 100 }]

  test("枠が空いていれば買える", () => {
    expect(
      toWorkPromotionSlotState({
        slot: "GENERAL",
        workId: "1",
        activePromotions: [],
      }),
    ).toEqual({ kind: "AVAILABLE" })
  })

  test("同じ枠でこの作品・別の作品が宣伝中かを分ける", () => {
    expect(
      toWorkPromotionSlotState({
        slot: "GENERAL",
        workId: "1",
        activePromotions: active,
      }),
    ).toEqual({ kind: "THIS_WORK", endsAt: 100 })
    expect(
      toWorkPromotionSlotState({
        slot: "GENERAL",
        workId: "2",
        activePromotions: active,
      }),
    ).toEqual({ kind: "OTHER_WORK", endsAt: 100 })
  })

  test("全年齢と R18 は別の枠", () => {
    expect(
      toWorkPromotionSlotState({
        slot: "SENSITIVE",
        workId: "2",
        activePromotions: active,
      }),
    ).toEqual({ kind: "AVAILABLE" })
  })
})
