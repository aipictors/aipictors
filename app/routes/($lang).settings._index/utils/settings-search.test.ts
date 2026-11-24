import { describe, expect, test } from "bun:test"
import {
  normalizeSettingsSearchText,
  searchSettings,
} from "~/routes/($lang).settings._index/utils/settings-search"

const firstHref = (query: string) => searchSettings(query)[0]?.href
const firstJa = (query: string) => searchSettings(query)[0]?.ja

describe("設定の検索", () => {
  test("カタカナ・ひらがな・全角半角・大文字小文字・長音をそろえる", () => {
    expect(normalizeSettingsSearchText("スタンプ")).toBe("すたんぷ")
    expect(normalizeSettingsSearchText("ＰＵＳＨ 通知")).toBe("push通知")
    expect(normalizeSettingsSearchText("ﾊﾟｽﾜｰﾄﾞ")).toBe("ぱすわど")
  })

  test("日本語・ひらがな・カタカナ・英語のどれでもページが見つかる", () => {
    expect(firstHref("スタンプ")).toBe("/settings/sticker")
    expect(firstHref("すたんぷ")).toBe("/settings/sticker")
    expect(firstHref("sticker")).toBe("/settings/sticker")
    expect(firstHref("Stickers")).toBe("/settings/sticker")
    expect(firstHref("通知")).toBe("/settings/notification")
    expect(firstHref("つうち")).toBe("/settings/notification")
    expect(firstHref("ツウチ")).toBe("/settings/notification")
    expect(firstHref("notification")).toBe("/settings/notification")
  })

  test("ページの中の項目でも見つかり、下の階層の URL に飛ぶ", () => {
    expect(firstHref("パスワード")).toBe("/settings/account/password")
    expect(firstHref("password")).toBe("/settings/account/password")
    expect(firstHref("たいかい")).toBe("/settings/account/withdrawal")
    expect(firstHref("ダークモード")).toBe("/settings/color")
    expect(firstHref("dark")).toBe("/settings/color")
    expect(firstJa("アイコン枠")).toBe("アイコン枠")
    expect(firstHref("振込")).toBe("/settings/creator-rewards")
    expect(firstHref("受け取り拒否")).toBe(
      "/settings/support-received#receive-setting",
    )
    expect(firstHref("受け取らない")).toBe(
      "/settings/support-received#receive-setting",
    )
  })

  test("言い換えでも見つかる", () => {
    expect(searchSettings("R18").map((e) => e.href)).toContain(
      "/settings/restriction",
    )
    expect(firstHref("ブロック")).toBe("/settings/blocked/users")
    expect(firstHref("ユーザーブロック")).toBe("/settings/blocked/users")
  })

  test("空白で区切るとすべての語を含むものだけ", () => {
    expect(firstHref("タグ ミュート")).toBe("/settings/muted/tags")
    expect(firstHref("ユーザー ミュート")).toBe("/settings/muted/users")
  })

  test("空や当たらない語は空", () => {
    expect(searchSettings("")).toEqual([])
    expect(searchSettings("   ")).toEqual([])
    expect(searchSettings("zzzzz")).toEqual([])
  })
})
