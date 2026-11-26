import { describe, expect, test } from "bun:test"
import { withEnglishWorkRobots } from "~/utils/english-work-robots"

describe("withEnglishWorkRobots", () => {
  const indexable = [
    { title: "作品" },
    { name: "robots", content: "index, follow, max-image-preview:large" },
  ]

  test("英語の作品ページは noindex, follow にする", () => {
    expect(withEnglishWorkRobots(indexable, "en")).toContainEqual({
      name: "robots",
      content: "noindex, follow",
    })
  })

  test("日本語の作品ページはそのまま", () => {
    expect(withEnglishWorkRobots(indexable, undefined)).toEqual(indexable)
    expect(withEnglishWorkRobots(indexable, "ja")).toEqual(indexable)
  })

  test("もともと noindex の作品（R18 の一部など）はそのまま", () => {
    const noindex = [{ name: "robots", content: "noindex, nofollow" }]
    expect(withEnglishWorkRobots(noindex, "en")).toEqual(noindex)
  })
})
