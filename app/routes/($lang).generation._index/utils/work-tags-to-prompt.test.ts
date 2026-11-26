import { describe, expect, test } from "bun:test"
import { workTagsToPrompt } from "./work-tags-to-prompt"

const dictionary = [
  { name: "猫耳", words: ["cat ears"] },
  { name: "制服", words: ["school uniform"] },
  { name: "青髪", words: ["blue hair"] },
]

describe("workTagsToPrompt", () => {
  test("日本語タグは辞書で英語にし、英語タグはそのまま使う", () => {
    expect(
      workTagsToPrompt(["猫耳", "1girl", "制服", "Blue_Hair"], dictionary),
    ).toBe("cat ears, 1girl, school uniform, blue hair")
  })

  test("辞書にない日本語タグと生成ツール名のタグは使わない", () => {
    expect(
      workTagsToPrompt(
        ["オリジナル", "AIイラスト", "NovelAI", "猫耳"],
        dictionary,
      ),
    ).toBe("cat ears")
  })

  test("重複をまとめる", () => {
    expect(workTagsToPrompt(["青髪", "blue hair"], dictionary)).toBe(
      "blue hair",
    )
  })

  test("使えるタグがなければ空文字", () => {
    expect(workTagsToPrompt(["オリジナル"], dictionary)).toBe("")
  })
})
