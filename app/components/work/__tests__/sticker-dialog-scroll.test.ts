import { describe, expect, test } from "bun:test"
import { readFileSync } from "node:fs"

const dialogPaths = [
  "app/components/work/sticker-dialog.tsx",
  "app/routes/($lang)._main.posts.$post._index/components/sticker-dialog.tsx",
]

describe("スタンプ一覧のスクロール", () => {
  for (const path of dialogPaths) {
    test(`${path} はスクロールする場所が 1 つだけ`, () => {
      const source = readFileSync(path, "utf8")
      const start = source.indexOf("<ScrollArea")
      const openingEnd = source.indexOf("<AddStickerButton", start)
      const wrapper = source.slice(start, openingEnd)

      // 入れ子にするとスマホで下へ送る途中で止まり、バーも一覧の動きと合わない
      expect(wrapper).not.toContain("overflow-y-auto")
      expect(wrapper).not.toContain("h-[80vh]")
      expect(wrapper).not.toContain("w-[80vw]")
    })
  }

  test("一括表示はスクロールする枠を基準に先読みする", () => {
    const source = readFileSync(
      "app/routes/($lang)._main.posts.$post._index/components/sticker-bulk-grid.tsx",
      "utf8",
    )

    // root を省くと rootMargin が枠に効かず、一番下に着くまで次を読まない
    expect(source).toContain(
      'root: sentinel.closest("[data-radix-scroll-area-viewport]")',
    )
  })
})
