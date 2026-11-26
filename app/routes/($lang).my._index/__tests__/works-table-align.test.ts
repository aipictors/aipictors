import { describe, expect, test } from "bun:test"
import { readFileSync } from "node:fs"

describe("自分の作品の表", () => {
  test("数字の列の見出しは数字と同じく右に寄せる", () => {
    const source = readFileSync(
      "app/routes/($lang).my._index/components/my-work-items.tsx",
      "utf8",
    )

    // 見出しが左寄せ・数字が右寄せで、いいねなどの列の位置がずれて見えていた
    expect(source).toContain('props.align === "right" && "text-right"')
    expect(source).toContain(
      'className="whitespace-nowrap px-2 py-2 text-right tabular-nums"',
    )
    // 並べ替えアイコンを文字の右に置くと、文字の右端が数字の右端からずれる
    expect(source).not.toContain("flex-row-reverse")
  })
})
