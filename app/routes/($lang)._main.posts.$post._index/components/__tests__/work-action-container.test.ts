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

  test("R-15 の作品は R-15 の設定を使う（センシティブ扱いでもセンシティブの設定は使わない）", () => {
    expect(
      isAnonymousLikeBySetting(
        { ...setting, isAnonymousLikeR15: false },
        true,
        "R15",
      ),
    ).toBe(false)
    expect(
      isAnonymousLikeBySetting(
        {
          isAnonymousLikeAllAges: false,
          isAnonymousLikeR15: true,
          isAnonymousLikeSensitive: false,
        },
        true,
        "R15",
      ),
    ).toBe(true)
  })

  test("R-15 の設定がなければ全年齢の設定を使う", () => {
    expect(isAnonymousLikeBySetting(setting, true, "R15")).toBe(true)
    expect(
      isAnonymousLikeBySetting({ isAnonymousLikeSensitive: true }, true, "R15"),
    ).toBe(false)
  })

  test("R18・R18G はセンシティブの設定、G は全年齢の設定", () => {
    const s = { ...setting, isAnonymousLikeR15: true }
    expect(isAnonymousLikeBySetting(s, true, "R18")).toBe(false)
    expect(isAnonymousLikeBySetting(s, true, "R18G")).toBe(false)
    expect(isAnonymousLikeBySetting(s, false, "G")).toBe(true)
  })
})
