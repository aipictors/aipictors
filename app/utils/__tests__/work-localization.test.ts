import { describe, expect, test } from "bun:test"
import {
  applyWorkLocalization,
  parseAcceptLanguage,
  pickWorkLanguage,
  type WorkLocalization,
} from "~/utils/work-localization"

const entry = (title: string, imageIndex: number) => ({
  title,
  description: `${title} の説明`,
  imageIndex,
})

const localization: WorkLocalization = {
  languages: {
    ja: entry("はじめまして", 0),
    en: entry("Nice to meet you", 1),
    "zh-Hans": entry("初次见面", 2),
    "zh-Hant": entry("初次見面", 3),
    ko: entry("처음 뵙겠습니다", 4),
  },
}

const work = {
  id: "1",
  title: "はじめまして",
  enTitle: "Nice to meet you",
  description: "日本語",
  enDescription: "English",
  imageURL: "ja.webp",
  subWorks: [
    { id: "s1", imageUrl: "en.webp" },
    { id: "s2", imageUrl: "zh-Hans.webp" },
    { id: "s3", imageUrl: "zh-Hant.webp" },
    { id: "s4", imageUrl: "ko.webp" },
  ],
  user: { login: "pictorchan" },
}

describe("pickWorkLanguage", () => {
  test("日本語の画面・日本語のブラウザは日本語", () => {
    expect(pickWorkLanguage(localization, "ja", ["ja-JP", "en"])).toBe("ja")
  })

  test("英語の画面は英語（日本語のブラウザでも /en を開いたら英語）", () => {
    expect(pickWorkLanguage(localization, "en", ["en-US"])).toBe("en")
    expect(pickWorkLanguage(localization, "en", ["ja", "ko"])).toBe("en")
  })

  test("ブラウザがほかの言語を先に希望していればその言語", () => {
    expect(pickWorkLanguage(localization, "en", ["ko-KR", "en"])).toBe("ko")
    expect(pickWorkLanguage(localization, "en", ["zh-TW"])).toBe("zh-Hant")
    expect(pickWorkLanguage(localization, "en", ["zh-Hant-HK"])).toBe("zh-Hant")
    expect(pickWorkLanguage(localization, "ja", ["zh-CN", "ja"])).toBe(
      "zh-Hans",
    )
  })

  test("無い言語は飛ばして、なければ画面の言語", () => {
    expect(pickWorkLanguage(localization, "en", ["th", "ko"])).toBe("ko")
    expect(pickWorkLanguage(localization, "en", ["th"])).toBe("en")
    expect(pickWorkLanguage(localization, "ja", [])).toBe("ja")
  })
})

describe("parseAcceptLanguage", () => {
  test("q の順に並べる", () => {
    expect(parseAcceptLanguage("en;q=0.5,ko-KR,zh-TW;q=0.8")).toEqual([
      "ko-KR",
      "zh-TW",
      "en",
    ])
    expect(parseAcceptLanguage(null)).toEqual([])
  })
})

describe("applyWorkLocalization", () => {
  test("選んだ言語の画像を先頭にして、タイトル・説明もその言語にする", () => {
    const result = applyWorkLocalization(work, localization, "ko")
    expect(result.title).toBe("처음 뵙겠습니다")
    expect(result.enTitle).toBe("처음 뵙겠습니다")
    expect(result.description).toBe("처음 뵙겠습니다 の説明")
    expect(result.imageURL).toBe("ko.webp")
    expect(result.subWorks.map((subWork) => subWork.imageUrl)).toEqual([
      "ja.webp",
      "en.webp",
      "zh-Hans.webp",
      "zh-Hant.webp",
    ])
  })

  test("日本語は元の並びのまま", () => {
    const result = applyWorkLocalization(work, localization, "ja")
    expect(result.imageURL).toBe("ja.webp")
    expect(result.subWorks.map((subWork) => subWork.id)).toEqual([
      "s1",
      "s2",
      "s3",
      "s4",
    ])
  })

  test("無い言語なら作品はそのまま", () => {
    expect(applyWorkLocalization(work, localization, "fr")).toBe(work)
  })
})
