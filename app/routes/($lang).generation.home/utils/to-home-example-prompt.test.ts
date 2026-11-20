import { describe, expect, test } from "bun:test"
import { toHomeExamplePrompt } from "~/routes/($lang).generation.home/utils/to-home-example-prompt"

describe("toHomeExamplePrompt", () => {
  test("LoRA の指定を外して区切りをまとめる", () => {
    expect(
      toHomeExamplePrompt(
        "1girl, <lora:flat2:-0.5>, smile,  <LYCO:abc:1> ,sky",
      ),
    ).toBe("1girl, smile, sky")
  })

  test("改行は残して空の行を消す", () => {
    expect(toHomeExamplePrompt("masterpiece,\n\n<lora:x:1>\n1girl, solo")).toBe(
      "masterpiece\n1girl, solo",
    )
  })

  test("日本語の文章はそのまま", () => {
    expect(toHomeExamplePrompt("桜の下で笑う女の子")).toBe("桜の下で笑う女の子")
  })
})
