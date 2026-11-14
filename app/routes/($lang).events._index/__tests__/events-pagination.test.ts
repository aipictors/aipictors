import { describe, expect, test } from "bun:test"
import { readFileSync } from "node:fs"

const source = readFileSync(
  "app/routes/($lang).events._index/route.tsx",
  "utf8",
)

describe("イベント一覧のページ番号", () => {
  test("1 ページめ・リセットのリンクがトップページを指さない", () => {
    // href="." は /events から見て / になり、ホームへ飛んでいた
    expect(source).not.toContain('href="."')
    expect(source).not.toContain(': "."')
  })

  test("公式イベントのタブでページを移ってもタブを保つ", () => {
    expect(source).toContain('params.set("tab", "official")')
    expect(source).toContain("<Tabs value={tab} onValueChange={setTab}")
  })
})

describe("R18 だけのイベントのカバー絵", () => {
  test("R18 / R18G だけのときだけぼかす", async () => {
    const { isR18OnlyEvent } = await import(
      "~/routes/($lang).events._index/components/app-event-card"
    )
    expect(isR18OnlyEvent(["R18"])).toBe(true)
    expect(isR18OnlyEvent(["R18", "R18G"])).toBe(true)
    // 全年齢・R15 も受け付けるイベントのカバーは全年齢向けとみなす
    expect(isR18OnlyEvent(["G", "R15", "R18"])).toBe(false)
    expect(isR18OnlyEvent([])).toBe(false)
    expect(isR18OnlyEvent(null)).toBe(false)
  })
})
