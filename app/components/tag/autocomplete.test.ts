import { describe, expect, test } from "bun:test"
import { filterAutocompleteOptions } from "./autocomplete"

const toOptions = (texts: string[]) =>
  texts.map((text, index) => ({ id: String(index), text }))

describe("filterAutocompleteOptions", () => {
  test("入力がなければ候補を出さない", () => {
    expect(filterAutocompleteOptions(toOptions(["猫"]), " ")).toEqual([])
  })

  test("前方一致を先に並べる", () => {
    const options = toOptions(["黒猫", "猫耳", "犬"])
    expect(filterAutocompleteOptions(options, "猫").map((o) => o.text)).toEqual(
      ["猫耳", "黒猫"],
    )
  })

  test("大文字と小文字を区別しない", () => {
    const options = toOptions(["Stable Diffusion"])
    expect(filterAutocompleteOptions(options, "stable")).toHaveLength(1)
  })

  test("多くても 30 件まで", () => {
    const options = toOptions(Array.from({ length: 2048 }, (_, i) => `猫${i}`))
    expect(filterAutocompleteOptions(options, "猫")).toHaveLength(30)
  })
})
