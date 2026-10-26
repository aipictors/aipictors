import { describe, expect, test } from "bun:test"
import {
  toNormalModeRatings,
  toSensitiveModeRatings,
} from "~/utils/viewer-ratings"

describe("toNormalModeRatings", () => {
  test("未ログインは G と R15", () => {
    expect(
      toNormalModeRatings({ isLoggedIn: false, preferenceRating: null }),
    ).toEqual(["G", "R15"])
  })

  test("R15表示OFF（G）は G のみ", () => {
    expect(
      toNormalModeRatings({ isLoggedIn: true, preferenceRating: "G" }),
    ).toEqual(["G"])
  })

  test("設定が存在しないログインユーザは G のみ", () => {
    expect(
      toNormalModeRatings({ isLoggedIn: true, preferenceRating: null }),
    ).toEqual(["G"])
  })

  test("R15表示ON・R18切り替え表示中は G と R15", () => {
    for (const preferenceRating of ["R15", "R18", "R18G"] as const) {
      expect(
        toNormalModeRatings({ isLoggedIn: true, preferenceRating }),
      ).toEqual(["G", "R15"])
    }
  })
})

describe("toSensitiveModeRatings", () => {
  test("未ログインは R18 と R18G", () => {
    expect(
      toSensitiveModeRatings({ isLoggedIn: false, preferenceRating: null }),
    ).toEqual(["R18", "R18G"])
  })

  test("R18G表示OFFは R18 のみ", () => {
    expect(
      toSensitiveModeRatings({ isLoggedIn: true, preferenceRating: "R18" }),
    ).toEqual(["R18"])
  })

  test("R18G表示ONは R18 と R18G", () => {
    expect(
      toSensitiveModeRatings({ isLoggedIn: true, preferenceRating: "R18G" }),
    ).toEqual(["R18", "R18G"])
  })
})
