import { describe, expect, test } from "bun:test"
import { shouldRestoreMediaDraft } from "~/routes/($lang)._main.new.image/utils/post-image-draft"

describe("shouldRestoreMediaDraft", () => {
  test("ふつうに投稿画面を開いたときは、前回の画像を戻す", () => {
    expect(
      shouldRestoreMediaDraft({
        hasGenerationParam: false,
        currentItemCount: 0,
      }),
    ).toBe(true)
  })

  test("生成履歴から投稿するときは戻さない（選んだ画像が1枚に上書きされるため）", () => {
    expect(
      shouldRestoreMediaDraft({
        hasGenerationParam: true,
        currentItemCount: 0,
      }),
    ).toBe(false)
  })

  test("すでに画像が入っているときは戻さない", () => {
    expect(
      shouldRestoreMediaDraft({
        hasGenerationParam: false,
        currentItemCount: 4,
      }),
    ).toBe(false)
  })
})
