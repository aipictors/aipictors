import { formatPromptText, removeEmptyPromptParts } from "~/routes/($lang).generation._index/utils/format-prompt-text"
import { describe, expect, test } from "bun:test"

describe("formatPromptText", () => {
  test("should remove leading and trailing whitespace from each text segment", () => {
    const input = "  text1 , text2 , text3  "
    const expectedOutput = "text1,text2,text3"
    const result = formatPromptText(input)
    expect(result).toBe(expectedOutput)
  })

  test("should remove empty text segments", () => {
    const input = "text1,,text2,,text3"
    const expectedOutput = "text1,text2,text3"
    const result = formatPromptText(input)
    expect(result).toBe(expectedOutput)
  })

  test("should preserve the order of text segments", () => {
    const input = "text3,text1,text2"
    const expectedOutput = "text3,text1,text2"
    const result = formatPromptText(input)
    expect(result).toBe(expectedOutput)
  })
})

test("removeEmptyPromptParts は空要素だけを消し、空白は残す", () => {
  expect(removeEmptyPromptParts("a,, b,")).toBe("a, b")
})
