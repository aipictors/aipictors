import { describe, expect, test } from "bun:test"
import { readFileSync } from "node:fs"

describe("小説・コラムの編集ページの本文", () => {
  test("本文ファイルが届いたら入力中の本文に入れる", () => {
    const source = readFileSync(
      "app/routes/($lang)._main.posts.$post.text.edit._index/route.tsx",
      "utf8",
    )
    const start = source.indexOf(
      'dispatchInput({ type: "SET_MD", payload: markdownContent })',
    )

    // INITIALIZE のときは本文がまだ届いていないことが多く、空のままだと更新・プレビューができない
    expect(start).toBeGreaterThan(-1)
    expect(source.slice(start, start + 120)).toContain("[markdownContent]")
  })
})
