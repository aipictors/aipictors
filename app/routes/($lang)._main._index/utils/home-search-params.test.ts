import { expect, test } from "bun:test"
import {
  buildHomeTabSearchParams,
  getInitialIsOneWorkPerUser,
  getInitialIsPagination,
  getInitialIsPromptPublic,
  getInitialPageValue,
  getInitialSortType,
  getInitialTimeRange,
  getInitialWorkType,
  getInitialWorkView,
} from "./home-search-params"

const params = (query: string) => new URLSearchParams(query)

const baseState = {
  currentTab: "new" as const,
  newWorksPage: 0,
  followUserFeedPage: 0,
  followTagFeedPage: 0,
  timeRange: "ALL",
  workView: "new",
  internalIsPagination: true,
  isOneWorkPerUser: false,
}

const build = (query: string, state: Partial<typeof baseState> | object) => {
  const next = params(query)
  buildHomeTabSearchParams(next, { ...baseState, ...state })
  return next.toString()
}

test("ページ番号は 0〜100 の数だけ受け取る", () => {
  expect(getInitialPageValue(params("page=3"))).toBe(3)
  expect(getInitialPageValue(params("page=100"))).toBe(100)
  expect(getInitialPageValue(params("page=101"))).toBe(0)
  expect(getInitialPageValue(params("page=-1"))).toBe(0)
  expect(getInitialPageValue(params("page=x"))).toBe(0)
  expect(getInitialPageValue(params(""))).toBe(0)
})

test("種類は ALL と未指定を null にする", () => {
  expect(getInitialWorkType(params("workType=VIDEO"))).toBe("VIDEO")
  expect(getInitialWorkType(params("workType=ALL"))).toBeNull()
  expect(getInitialWorkType(params(""))).toBeNull()
})

test("プロンプトの有無", () => {
  expect(getInitialIsPromptPublic(params("isPromptPublic=true"))).toBe(true)
  expect(getInitialIsPromptPublic(params("isPromptPublic=false"))).toBe(false)
  expect(getInitialIsPromptPublic(params("isPromptPublic=x"))).toBeNull()
})

test("並び順は決まった値だけ受け取る", () => {
  expect(getInitialSortType(params("sortType=LIKES_COUNT"))).toBe("LIKES_COUNT")
  expect(getInitialSortType(params("sortType=x"))).toBeNull()
})

test("期間、表示、ページ送りの既定値", () => {
  expect(getInitialTimeRange(params(""))).toBe("ALL")
  expect(getInitialTimeRange(params("timeRange=WEEK"))).toBe("WEEK")
  expect(getInitialIsOneWorkPerUser(params("isOneWorkPerUser=true"))).toBe(true)
  expect(getInitialIsOneWorkPerUser(params(""))).toBe(false)
  expect(getInitialWorkView(params(""))).toBe("new")
  expect(getInitialWorkView(params("view=popular"))).toBe("popular")
  expect(getInitialIsPagination(params(""))).toBe(true)
  expect(getInitialIsPagination(params("isPagination=false"))).toBe(false)
})

test("新着タブの状態を URL に書き、既定値なら消す", () => {
  expect(
    build("page=9&timeRange=WEEK&view=popular&isOneWorkPerUser=true&x=1", {}),
  ).toBe("x=1")
  expect(
    build("", {
      newWorksPage: 2,
      timeRange: "WEEK",
      workView: "popular",
      isOneWorkPerUser: true,
      internalIsPagination: false,
    }),
  ).toBe(
    "page=2&timeRange=WEEK&view=popular&isPagination=false&isOneWorkPerUser=true",
  )
})

test("タブごとのページ番号を使う", () => {
  expect(
    build("", {
      currentTab: "follow-user",
      newWorksPage: 1,
      followUserFeedPage: 2,
      followTagFeedPage: 3,
    }),
  ).toBe("page=2")
  expect(
    build("", {
      currentTab: "follow-tag",
      newWorksPage: 1,
      followUserFeedPage: 2,
      followTagFeedPage: 3,
    }),
  ).toBe("page=3")
})

test("ホームタブでは新着の絞り込みとページを URL から消す", () => {
  expect(
    build("page=9&timeRange=WEEK&view=popular&isOneWorkPerUser=true", {
      currentTab: "home",
      newWorksPage: 5,
      timeRange: "WEEK",
      workView: "popular",
      isOneWorkPerUser: true,
    }),
  ).toBe("")
})
