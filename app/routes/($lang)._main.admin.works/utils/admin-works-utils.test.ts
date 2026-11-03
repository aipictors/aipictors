import { expect, test } from "bun:test"
import {
  buildAdminWorksWhere,
  getJstDateRange,
  getJstDateString,
  parseWorkIds,
  toAccessTypeText,
  toAdminAccessTypeText,
  toWorkTypeText,
} from "./admin-works-utils"

const empty = {
  dateFilter: "",
  ownerFilter: "",
  ratingFilter: "ALL",
  titleFilter: "",
  workIdFilter: "",
}

test("作品 ID は区切りをまたいで正の整数だけ取り出す", () => {
  expect(parseWorkIds("12, 34、56 78\n9")).toEqual([
    "12",
    "34",
    "56",
    "78",
    "9",
  ])
  expect(parseWorkIds("a, 0, -1, 7x")).toEqual(["7"])
  expect(parseWorkIds("")).toEqual([])
})

test("JST の日付の文字列と 1 日の範囲", () => {
  expect(getJstDateString(new Date("2026-01-01T15:00:00Z"))).toBe("2026-01-02")
  expect(getJstDateRange("2026-01-02")).toEqual({
    createdAtAfter: "2026-01-01T15:00:00.000Z",
    beforeCreatedAt: "2026-01-02T14:59:59.999Z",
  })
  expect(getJstDateRange("")).toBeNull()
})

test("状態の表示", () => {
  expect(toAccessTypeText("LIMITED")).toBe("限定公開")
  expect(toAccessTypeText("X")).toBe("X")
  expect(toAdminAccessTypeText("TEMPORARY_PRIVATE")).toBe("一時非公開")
  expect(toAdminAccessTypeText("X")).toBe("X")
  expect(toWorkTypeText("NOVEL")).toBe("小説")
  expect(toWorkTypeText("X")).toBe("X")
})

test("条件がなければ全年齢区分と非公開を含めて探す", () => {
  expect(buildAdminWorksWhere(empty)).toEqual({
    isIncludePrivate: true,
    ratings: ["G", "R15", "R18", "R18G"],
  })
})

test("絞り込みを条件にする（空白は除き、ID が読めなければ付けない）", () => {
  expect(
    buildAdminWorksWhere({
      dateFilter: "2026-01-02",
      ownerFilter: " 作者 ",
      ratingFilter: "R18",
      titleFilter: " 題名 ",
      workIdFilter: "1,2",
    }),
  ).toEqual({
    isIncludePrivate: true,
    ratings: ["R18"],
    ids: ["1", "2"],
    search: "題名",
    ownerName: "作者",
    createdAtAfter: "2026-01-01T15:00:00.000Z",
    beforeCreatedAt: "2026-01-02T14:59:59.999Z",
  })
  expect(
    buildAdminWorksWhere({ ...empty, workIdFilter: "x" }),
  ).not.toHaveProperty("ids")
  expect(
    buildAdminWorksWhere({ ...empty, titleFilter: "  " }),
  ).not.toHaveProperty("search")
})
