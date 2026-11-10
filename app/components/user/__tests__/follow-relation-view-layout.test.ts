import { describe, expect, test } from "bun:test"
import { readFileSync } from "node:fs"

describe("フォロー一覧のシンプル表示", () => {
  test("スマホの列幅を画面内に固定する", () => {
    const source = readFileSync(
      "app/components/user/follow-relation-view.tsx",
      "utf8",
    )
    const grids = source.match(/className="grid [^"]*md:grid-cols-2[^"]*"/g)

    // 列数を省くと列幅が中身に合わせて広がり、紹介文の長い URL などで右側が見切れる
    expect(grids).toHaveLength(2)
    for (const grid of grids ?? []) {
      expect(grid).toContain(" grid-cols-1 ")
    }
  })
})
