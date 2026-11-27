import { describe, expect, test } from "bun:test"
import { formatSearchTabCount } from "~/routes/($lang)._main.search/utils/search-tab-count"

describe("formatSearchTabCount", () => {
  test("件数を 3 桁区切りで出し、上限で止めた数には + を付ける", () => {
    expect(formatSearchTabCount(0)).toBe("0")
    expect(formatSearchTabCount(123)).toBe("123")
    expect(formatSearchTabCount(12345)).toBe("12,345")
    expect(formatSearchTabCount(1000, true)).toBe("1,000+")
  })

  test("数えていないときは出さない", () => {
    expect(formatSearchTabCount(null)).toBeNull()
    expect(formatSearchTabCount(undefined)).toBeNull()
  })
})
