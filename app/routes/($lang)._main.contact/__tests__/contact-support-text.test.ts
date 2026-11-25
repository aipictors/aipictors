import { describe, expect, test } from "bun:test"
import { readFileSync } from "node:fs"

const paths = [
  "app/routes/($lang)._main.contact/route.tsx",
  "app/routes/($lang)._main.plus._index/components/plus-form.tsx",
]

describe("お問い合わせの案内", () => {
  for (const path of paths) {
    test(`${path} はスタッフが返事するとは書かない`, () => {
      const source = readFileSync(path, "utf8")
      // お問い合わせチャットは AI だけが答える。有人の対応があるように書くと、利用者が返事を待ってしまう
      expect(source).not.toContain("スタッフが同じチャットでお返事します")
      expect(source).not.toContain("スタッフが確認します")
      expect(source).not.toContain("our staff")
    })
  }
})
