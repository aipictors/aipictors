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
