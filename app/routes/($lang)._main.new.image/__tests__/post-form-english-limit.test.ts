import { describe, expect, test } from "bun:test"
import { safeParse } from "valibot"
import { vPostImageForm } from "~/routes/($lang)._main.new.image/validations/post-image-form"
import { vPostTextForm } from "~/routes/($lang)._main.new.image/validations/post-text-form"

const base = {
  title: "短いタイトル",
  caption: "",
  enTitle: "",
  enCaption: "",
  thumbnailBase64: "data",
}

describe("英語のタイトル・キャプションの上限", () => {
  test("自動翻訳で長くなった英語があっても保存できる", () => {
    const long = { ...base, enTitle: "a".repeat(359), enCaption: "a".repeat(3252) }
    expect(safeParse(vPostImageForm, long).success).toBe(true)
    expect(safeParse(vPostTextForm, { ...long, md: "本文" }).success).toBe(true)
  })

  test("上限を超えたら英語の欄だと分かる文言を出す", () => {
    const result = safeParse(vPostImageForm, {
      ...base,
      enTitle: "a".repeat(1001),
    })
    expect(result.success).toBe(false)
    expect(result.issues?.[0].message).toContain("英語のタイトル")
  })

  test("日本語のタイトルは 120 文字のまま", () => {
    const result = safeParse(vPostImageForm, { ...base, title: "あ".repeat(121) })
    expect(result.success).toBe(false)
    expect(result.issues?.[0].message).toBe(
      "タイトルは120文字以内で入力してください",
    )
  })
})
