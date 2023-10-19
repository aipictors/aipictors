import { toDateText } from "app/_utils/toDateText"
import { describe, expect, test } from "vitest"

describe("toDateText", () => {
  test("1694951164", () => {
    const dateText = toDateText(1694951164)
    expect(dateText).toBe("2023年09月17日")
  })
})
