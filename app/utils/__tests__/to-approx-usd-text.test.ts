import { describe, expect, test } from "bun:test"
import { toApproxUsdText } from "~/utils/to-approx-usd-text"

describe("toApproxUsdText", () => {
  test("10 ドル未満は小数 1 桁まで、それ以上は整数", () => {
    expect(toApproxUsdText(240)).toBe("about $1.5")
    expect(toApproxUsdText(480)).toBe("about $3")
    expect(toApproxUsdText(990)).toBe("about $6.2")
    expect(toApproxUsdText(1980)).toBe("about $12")
    expect(toApproxUsdText(3980)).toBe("about $25")
  })
})
