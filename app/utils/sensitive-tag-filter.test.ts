import { describe, expect, test } from "bun:test"
import {
  hasNonIndexableSensitiveTag,
  isIndexableSensitiveTag,
  isMinorRelatedTag,
  isR18gRelatedTag,
  isRealPersonRelatedTag,
  isSuggestableSensitiveTag,
} from "~/utils/sensitive-tag-filter"

describe("isMinorRelatedTag", () => {
  test.each([
    "ロリ",
    "ろり",
    "ＪＫ",
    "jk",
    "女児",
    "おねショタ",
    "ランドセル",
    "小学生",
    "10歳",
    "17才",
    "Loli",
  ])("%s は対象", (tag) => {
    expect(isMinorRelatedTag(tag)).toBe(true)
  })

  test.each(["カロリー", "ファンタジー", "18歳", "20歳", "メイド", "猫"])(
    "%s は対象外",
    (tag) => {
      expect(isMinorRelatedTag(tag)).toBe(false)
    },
  )
})

describe("isRealPersonRelatedTag", () => {
  test("実在の人物を示す語を判定する", () => {
    expect(isRealPersonRelatedTag("KPOP")).toBe(true)
    expect(isRealPersonRelatedTag("女優")).toBe(true)
    expect(isRealPersonRelatedTag("ファンタジー")).toBe(false)
  })
})

describe("isR18gRelatedTag", () => {
  test("R18G に寄った語を判定する", () => {
    expect(isR18gRelatedTag("R18G")).toBe(true)
    expect(isR18gRelatedTag("リョナ")).toBe(true)
    expect(isR18gRelatedTag("グロ")).toBe(true)
    expect(isR18gRelatedTag("エログロ")).toBe(true)
    expect(isR18gRelatedTag("メイド")).toBe(false)
    expect(isR18gRelatedTag("グローブ")).toBe(false)
  })
})

describe("タグの出し分け", () => {
  test("一般的なタグは検索にもおすすめにも出す", () => {
    expect(isIndexableSensitiveTag("ファンタジー")).toBe(true)
    expect(isSuggestableSensitiveTag("ファンタジー")).toBe(true)
  })

  test("未成年を連想させるタグはどちらにも出さない", () => {
    expect(isIndexableSensitiveTag("幼女")).toBe(false)
    expect(isSuggestableSensitiveTag("幼女")).toBe(false)
  })

  test("同意のない行為を示すタグはおすすめに出さない", () => {
    expect(isSuggestableSensitiveTag("強姦")).toBe(false)
    expect(isSuggestableSensitiveTag("rape")).toBe(false)
    expect(isSuggestableSensitiveTag("grape")).toBe(true)
  })

  test("作品のタグに 1 つでも該当があれば載せない", () => {
    expect(hasNonIndexableSensitiveTag(["メイド", "幼女"])).toBe(true)
    expect(hasNonIndexableSensitiveTag(["メイド", "猫"])).toBe(false)
    expect(hasNonIndexableSensitiveTag([])).toBe(false)
  })
})
