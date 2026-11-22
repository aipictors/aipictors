import { describe, expect, test } from "bun:test"
import { readFileSync } from "node:fs"

const source = readFileSync(
  "app/routes/($lang).my._index/components/my-home-contents.tsx",
  "utf8",
)

describe("マイページホームのプロフィール欄", () => {
  test("名前の行ごと持ち上げず、アイコンだけをヘッダー画像に重ねる", () => {
    // スマホでニックネームがヘッダー画像に被って読みにくかった
    expect(source).not.toContain(
      'className="-mt-10 flex items-end gap-3 md:-mt-12"',
    )
    expect(source).toContain('<div className="flex items-end gap-3">')
    expect(source).toContain(
      '<div className="-mt-10 size-20 shrink-0 overflow-hidden rounded-full border-4 border-card bg-muted md:-mt-12 md:size-24">',
    )
  })
})
