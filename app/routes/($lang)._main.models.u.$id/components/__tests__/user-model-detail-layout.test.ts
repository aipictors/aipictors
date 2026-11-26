import { describe, expect, test } from "bun:test"
import { readFileSync } from "node:fs"

describe("みんなのモデルの詳細ページ", () => {
  test("スマホで画像とサムネイル列を画面幅に収める", () => {
    const source = readFileSync(
      "app/routes/($lang)._main.models.u.$id/components/user-model-detail.tsx",
      "utf8",
    )
    const grid = source.match(
      /className="grid [^"]*lg:grid-cols-\[minmax\(0,1fr\)_380px\][^"]*"/,
    )

    // 列数を省くと列幅が横スクロールのサムネイル列の全幅まで広がる
    expect(grid?.[0]).toContain(" grid-cols-1 ")
  })
})
