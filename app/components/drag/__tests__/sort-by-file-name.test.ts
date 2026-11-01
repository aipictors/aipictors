import { describe, expect, test } from "bun:test"
import {
  isSortedByFileName,
  sortByFileName,
} from "~/components/drag/sort-by-file-name"

const items = (...names: (string | null)[]) =>
  names.map((fileName, id) => ({ id, content: `c${id}`, fileName }))

describe("sortByFileName", () => {
  test("番号は数として比べ、id を振り直す", () => {
    const sorted = sortByFileName(items("10.png", "2.png", "1.png"))
    expect(sorted.map((item) => item.fileName)).toEqual([
      "1.png",
      "2.png",
      "10.png",
    ])
    expect(sorted.map((item) => item.id)).toEqual([0, 1, 2])
  })

  test("ファイル名のない画像は順番を保って後ろに", () => {
    const sorted = sortByFileName(items(null, "b.png", null, "a.png"))
    expect(sorted.map((item) => item.content)).toEqual([
      "c3",
      "c1",
      "c0",
      "c2",
    ])
  })

  test("isSortedByFileName", () => {
    expect(isSortedByFileName(items("1.png", "2.png", "10.png"))).toBe(true)
    expect(isSortedByFileName(items("10.png", "2.png"))).toBe(false)
    expect(isSortedByFileName(items("a.png", null))).toBe(true)
    expect(isSortedByFileName(items(null, "a.png"))).toBe(false)
  })
})
