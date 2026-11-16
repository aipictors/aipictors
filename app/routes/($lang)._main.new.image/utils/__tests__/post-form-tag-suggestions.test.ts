import { describe, expect, test } from "bun:test"
import { splitPostFormTagSuggestions } from "~/routes/($lang)._main.new.image/utils/post-form-tag-suggestions"

const tag = (text: string) => ({ id: text, text })

describe("splitPostFormTagSuggestions", () => {
  test("最近使ったタグがあってもおすすめタグを隠さない", () => {
    const result = splitPostFormTagSuggestions({
      tags: [],
      recentlyUsedTags: [tag("猫")],
      recommendedTags: [tag("少女")],
    })
    expect(result.recentlyUsedTags.map((t) => t.text)).toEqual(["猫"])
    expect(result.recommendedTags.map((t) => t.text)).toEqual(["少女"])
  })

  test("付けたタグと重なったタグは出さない", () => {
    const result = splitPostFormTagSuggestions({
      tags: [tag("猫")],
      recentlyUsedTags: [tag("猫"), tag("犬"), tag("犬")],
      recommendedTags: [tag("犬"), tag("海"), tag("")],
    })
    expect(result.recentlyUsedTags.map((t) => t.text)).toEqual(["犬"])
    expect(result.recommendedTags.map((t) => t.text)).toEqual(["海"])
  })
})
