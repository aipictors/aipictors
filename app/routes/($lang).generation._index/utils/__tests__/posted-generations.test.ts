import { describe, expect, test } from "bun:test"
import {
  toPostedWorkMap,
  toSearchableSeeds,
} from "~/routes/($lang).generation._index/utils/posted-generations"

const task = (nanoid: string, seed: number, prompt: string) => ({
  nanoid,
  seed,
  prompt,
})

describe("生成履歴の投稿済み", () => {
  test("Seed とプロンプトが同じ作品があれば投稿済み（空白・区切りの違いは無視）", () => {
    const map = toPostedWorkMap([task("a", 123, "1girl, Smile")], {
      links: [],
      works: [{ workId: "9", seed: "123", prompt: "1girl  smile" }],
    })
    expect(map.get("a")).toBe("9")
  })

  test("Seed が同じでもプロンプトが違えば別（Seed 固定で生成したとき）", () => {
    const map = toPostedWorkMap(
      [task("a", 123, "cat"), task("b", 123, "dog")],
      {
        links: [],
        works: [{ workId: "9", seed: "123", prompt: "dog" }],
      },
    )
    expect(map.has("a")).toBe(false)
    expect(map.get("b")).toBe("9")
  })

  test("投稿画面の記録を優先する（プロンプトを変えて投稿しても・2 枚目以降でも）", () => {
    const map = toPostedWorkMap([task("a", 123, "cat"), task("b", 5, "dog")], {
      links: [{ nanoid: "b", workId: "7" }],
      works: [{ workId: "9", seed: "5", prompt: "dog" }],
    })
    expect(map.get("b")).toBe("7")
    expect(map.has("a")).toBe(false)
  })

  test("プロンプトが空や Seed -1 は Seed で探さない", () => {
    expect(toSearchableSeeds([task("a", -1, "x"), task("b", 0, "x")])).toEqual(
      [],
    )
    expect(toSearchableSeeds([task("a", 5, "x"), task("b", 5, "y")])).toEqual([
      "5",
    ])
    const map = toPostedWorkMap([task("a", 5, "")], {
      links: [],
      works: [{ workId: "9", seed: "5", prompt: "" }],
    })
    expect(map.size).toBe(0)
  })
})
