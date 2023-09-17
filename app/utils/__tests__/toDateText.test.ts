import { expect, describe, test } from "vitest"
import { toDateText } from "app/utils/toDateText"

describe("toDateText", () => {
  test("1694951164", () => {
    const dateText = toDateText(1694951164)
    expect(dateText).toBe("2023年09月17日 20時46分")
  })
})
