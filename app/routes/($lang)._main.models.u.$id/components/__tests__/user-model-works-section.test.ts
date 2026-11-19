import { describe, expect, test } from "bun:test"
import { toUserModelWorksRatings } from "~/routes/($lang)._main.models.u.$id/components/user-model-works-section"

describe("みんなのモデルを使った作品の年齢区分", () => {
  test("全年齢・R-15 のモデルは全年齢・R-15 の作品だけ", () => {
    expect(toUserModelWorksRatings("G")).toEqual(["G", "R15"])
    expect(toUserModelWorksRatings("R15")).toEqual(["G", "R15"])
  })

  test("R-18 のモデルは R-18 の作品も出す", () => {
    expect(toUserModelWorksRatings("R18")).toEqual(["G", "R15", "R18", "R18G"])
    expect(toUserModelWorksRatings("R18G")).toEqual(["G", "R15", "R18", "R18G"])
  })
})
