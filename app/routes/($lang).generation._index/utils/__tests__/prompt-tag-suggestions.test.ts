import { describe, expect, test } from "bun:test"
import {
  applyPromptTag,
  findPromptToken,
  formatTagCount,
  formatTagForPrompt,
  parsePromptTagDictionary,
  searchPromptTags,
} from "~/routes/($lang).generation._index/utils/prompt-tag-suggestions"
import { kanaToRomaji } from "~/routes/($lang).generation._index/utils/kana-to-romaji"

const tags = parsePromptTagDictionary(
  [
    "1girl\t6008644\t0\t1girls,sole_female",
    "fate_testarossa\t9442\t4\tfate_t_harlaown",
    "test_tube\t5451\t0\t",
    "holding_test_tube\t1170\t0\t",
    "pregnancy_test\t900\t0\t",
    "testicles\t88000\t0\t",
    "test_plugsuit_(evangelion)\t800\t0\t",
    "^_^\t500\t0\t",
  ].join("\n"),
)

describe("findPromptToken", () => {
  test("カンマの後ろの入力中の単語", () => {
    const text = "1girl, smile, tes"
    expect(findPromptToken(text, text.length)).toEqual({
      start: 14,
      end: 17,
      query: "tes",
    })
  })

  test("括弧の中", () => {
    const text = "1girl, (tes:1.2)"
    const token = findPromptToken(text, 11)
    expect(token.query).toBe("tes")
    expect(text.slice(token.start, token.end)).toBe("tes")
  })
})

describe("searchPromptTags", () => {
  test("先頭一致 → 単語の先頭一致の順", () => {
    const names = searchPromptTags(tags, "test").map((tag) => tag.name)
    expect(names).toEqual([
      "test_tube",
      "test_plugsuit_(evangelion)",
      "fate_testarossa",
      "holding_test_tube",
      "pregnancy_test",
    ])
  })

  test("性的なタグは 5 文字以上打ったときだけ", () => {
    expect(searchPromptTags(tags, "test").map((tag) => tag.name)).not.toContain(
      "testicles",
    )
    expect(searchPromptTags(tags, "testi")[0].name).toBe("testicles")
  })

  test("空白は _ として探す", () => {
    expect(searchPromptTags(tags, "test t")[0].name).toBe("test_tube")
  })

  test("別名", () => {
    const [tag] = searchPromptTags(tags, "sole_f")
    expect(tag.name).toBe("1girl")
    expect(tag.matchedAlias).toBe("sole_female")
  })

  test("1 文字目から先頭一致で出す", () => {
    expect(searchPromptTags(tags, "t").map((tag) => tag.name)).toEqual([
      "test_tube",
      "test_plugsuit_(evangelion)",
    ])
  })

  test("全角英字（IME オン）でも出す", () => {
    expect(searchPromptTags(tags, "ｔｅｓｔ")[0].name).toBe("test_tube")
  })

  test("日本語の入力では出さない", () => {
    expect(searchPromptTags(tags, "女の子")).toEqual([])
  })
})

describe("applyPromptTag", () => {
  test("入力中の単語を置き換えてカンマを足す", () => {
    const text = "1girl, tes"
    const token = findPromptToken(text, text.length)
    expect(applyPromptTag(text, token, "test tube")).toEqual({
      text: "1girl, test tube, ",
      cursor: 18,
    })
  })

  test("途中の単語を置き換えても後ろは残す", () => {
    const text = "1girl, tes, smile"
    const token = findPromptToken(text, 10)
    expect(applyPromptTag(text, token, "test tube").text).toBe(
      "1girl, test tube, smile",
    )
  })

  test("括弧と重みは残す", () => {
    const text = "(tes:1.2), smile"
    const token = findPromptToken(text, 4)
    expect(applyPromptTag(text, token, "test tube").text).toBe(
      "(test tube:1.2), smile",
    )
  })
})

describe("format", () => {
  test("括弧はエスケープ・顔文字はそのまま", () => {
    expect(formatTagForPrompt("test_plugsuit_(evangelion)")).toBe(
      "test plugsuit \\(evangelion\\)",
    )
    expect(formatTagForPrompt("^_^")).toBe("^_^")
  })

  test("件数", () => {
    expect(formatTagCount(8780)).toBe("8.78k")
    expect(formatTagCount(644)).toBe("644")
    expect(formatTagCount(6008644)).toBe("6.01M")
  })
})

describe("kanaToRomaji", () => {
  test("日本語入力のまま打ったかなを英字に戻す", () => {
    expect(kanaToRomaji("すみ")).toBe("sumi")
    expect(kanaToRomaji("ｓみ".normalize("NFKC"))).toBe("smi")
    expect(kanaToRomaji("てすと")).toBe("tesuto")
    expect(kanaToRomaji("しょっと")).toBe("shotto")
  })
})
