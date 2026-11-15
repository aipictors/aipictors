import { describe, expect, test } from "bun:test"
import { isAnonymousLikeBySetting } from "~/routes/($lang)._main.posts.$post._index/components/work-action-container"

describe("作品画面のいいねを匿名にするか", () => {
  const setting = {
    isAnonymousLikeAllAges: true,
    isAnonymousLikeSensitive: false,
  }

  test("全年齢の作品は全年齢の設定を使う", () => {
    expect(isAnonymousLikeBySetting(setting, false)).toBe(true)
  })

  test("センシティブの作品はセンシティブの設定を使う", () => {
    expect(isAnonymousLikeBySetting(setting, true)).toBe(false)
  })

  test("設定を読めていなければ決めない", () => {
    expect(isAnonymousLikeBySetting(undefined, false)).toBeUndefined()
  })

  test("未設定の項目は設定画面と同じ初期値を使う", () => {
    expect(isAnonymousLikeBySetting({}, false)).toBe(false)
    expect(isAnonymousLikeBySetting({}, true)).toBe(true)
  })
})
