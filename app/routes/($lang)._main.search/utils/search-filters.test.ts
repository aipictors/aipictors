import { expect, test } from "bun:test"
import {
  buildSearchFilterParams,
  buildWorksWhere,
  chooseSearchMode,
  collectRelatedTags,
  getCurrentPage,
  getOrderFilter,
  getPromptFilter,
  getRatingFilter,
  getSearchBasePath,
  getStyleFilter,
  getUserFilter,
  normalizeTagQuery,
} from "./search-filters"

test("検索語は前後の空白と先頭の # を除く", () => {
  expect(normalizeTagQuery("  ##猫 ")).toBe("猫")
  expect(normalizeTagQuery("   ")).toBeNull()
  expect(normalizeTagQuery("#")).toBeNull()
  expect(normalizeTagQuery("＃小説")).toBe("小説")
  expect(normalizeTagQuery("＃＃ 小説")).toBe("小説")
  expect(normalizeTagQuery(null)).toBeNull()
})

test("年齢指定の既定はページで変わる", () => {
  expect(getRatingFilter("R15", false)).toBe("R15")
  expect(getRatingFilter(null, false)).toBe("G")
  expect(getRatingFilter(null, true)).toBe("R18")
  expect(getRatingFilter("x", true)).toBe("R18")
})

test("検索の URL は R18 だけ /r、言語の接頭辞を残す", () => {
  expect(getSearchBasePath("/search", "all")).toBe("/search")
  expect(getSearchBasePath("/search", "R18")).toBe("/r/search")
  expect(getSearchBasePath("/en/search", "R18")).toBe("/en/r/search")
})

test("絞り込みの値は決まったものだけ受け取る", () => {
  expect(getStyleFilter("REAL")).toBe("REAL")
  expect(getStyleFilter("x")).toBe("all")
  expect(getPromptFilter("with")).toBe("with")
  expect(getPromptFilter(null)).toBe("all")
  expect(getOrderFilter("old")).toBe("old")
  expect(getOrderFilter(null)).toBe("popular")
  expect(getUserFilter("123")).toBe("123")
  expect(getUserFilter("12a")).toBeNull()
})

test("ページ番号は 0 以上の整数にする", () => {
  expect(getCurrentPage("3.9")).toBe(3)
  expect(getCurrentPage("-1")).toBe(0)
  expect(getCurrentPage("x")).toBe(0)
  expect(getCurrentPage(null)).toBe(0)
})

test("作品の条件を作る", () => {
  expect(buildWorksWhere({ rating: "G", style: "all", prompt: "all" })).toEqual(
    { ratings: ["G"], orderBy: "LIKES_COUNT", sort: "DESC" },
  )
  expect(
    buildWorksWhere({
      tagQuery: "猫",
      rating: "R15",
      style: "REAL",
      prompt: "without",
      order: "old",
      userId: "1",
    }),
  ).toEqual({
    ratings: ["R15"],
    orderBy: "DATE_CREATED",
    sort: "ASC",
    userId: "1",
    tagNames: ["猫"],
    style: "REAL",
    hasPrompt: false,
  })
})

const data = {
  mode: "text" as const,
  filters: {
    order: "new" as const,
    prompt: "with" as const,
    rating: "R15" as const,
    style: "REAL" as const,
    userId: "1",
  },
}

test("今の条件を URL のパラメータにする", () => {
  expect(buildSearchFilterParams(data).toString()).toBe(
    "mode=text&age_limit=R15&order=new&user=1&style=REAL&prompt=with",
  )
})

test("変更を足す。mode の null は指定をなくし、ページは指定がなければ 0", () => {
  expect(
    buildSearchFilterParams(data, {
      mode: null,
      rating: "G",
      order: "popular",
      userId: null,
      style: "all",
      prompt: "all",
      page: 2,
    }).toString(),
  ).toBe("age_limit=&page=2")
  expect(buildSearchFilterParams(data, { mode: "tag" }).get("mode")).toBe("tag")
})

test("結果の種類を決める", () => {
  const choose = (
    textResult: { count: number } | null,
    requestedMode: string | null,
    tagWorksCount: number,
  ) => chooseSearchMode({ textResult, requestedMode, tagWorksCount })

  expect(choose(null, "text", 3)).toBe("tag")
  expect(choose({ count: 3 }, "tag", 3)).toBe("tag")
  expect(choose({ count: 0 }, "text", 3)).toBe("text")
  expect(choose({ count: 3 }, null, 0)).toBe("text")
  expect(choose({ count: 0 }, null, 0)).toBe("text")
  expect(choose({ count: 0 }, null, 3)).toBe("tag")
})

test("関連タグは多い順で、検索語と空白を除き、1 作品で重複を数えない", () => {
  expect(
    collectRelatedTags(
      [
        { tagNames: ["猫", "犬", "犬", " 鳥 "] },
        { tagNames: ["犬", "ねこ", " "] },
        { tagNames: null },
      ],
      "猫",
    ),
  ).toEqual(["犬", "鳥", "ねこ"])
})

test("関連タグは 16 件まで、英字は大文字小文字を区別せず検索語を除く", () => {
  const tagNames = Array.from({ length: 20 }, (_, index) => `t${index}`)
  expect(collectRelatedTags([{ tagNames }], null)).toHaveLength(16)
  expect(collectRelatedTags([{ tagNames: ["CAT", "dog"] }], "cat")).toEqual([
    "dog",
  ])
})
