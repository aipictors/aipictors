import { describe, expect, test } from "bun:test"
import {
  closeMenuOnNavigate,
  shouldCloseMenuOnClick,
} from "~/utils/close-menu-on-navigate"

type FakeElement = {
  tag: string
  attrs: Record<string, string>
  parent: FakeElement | null
}

/** closest / hasAttribute だけの小さな要素（DOM を使わずに判定を確かめる） */
const el = (
  tag: string,
  attrs: Record<string, string> = {},
  parent: FakeElement | null = null,
) => {
  const node: FakeElement & {
    closest(selector: string): unknown
    hasAttribute(name: string): boolean
  } = {
    tag,
    attrs,
    parent,
    hasAttribute: (name) => name in attrs,
    closest(selector) {
      let cur: FakeElement | null = node
      while (cur) {
        const c = cur
        const hit = selector.split(",").some((s) => {
          const q = s.trim()
          if (q === "a[href]") return c.tag === "a" && "href" in c.attrs
          if (q === "button") return c.tag === "button"
          if (q === "[role='menuitem']") return c.attrs.role === "menuitem"
          if (q === "[data-keep-menu-open]")
            return "data-keep-menu-open" in c.attrs
          return false
        })
        if (hit)
          return {
            ...c,
            hasAttribute: (n: string) => n in c.attrs,
            closest: node.closest,
          }
        cur = cur.parent
      }
      return null
    },
  }
  return node
}

describe("メニューの中を押したら閉じる", () => {
  test("リンク（中のアイコンや文字を押しても）・ボタン・メニュー項目は閉じる", () => {
    const link = el("a", { href: "/" })
    expect(shouldCloseMenuOnClick(link as never)).toBe(true)
    expect(shouldCloseMenuOnClick(el("span", {}, link) as never)).toBe(true)
    expect(shouldCloseMenuOnClick(el("button") as never)).toBe(true)
    expect(
      shouldCloseMenuOnClick(el("div", { role: "menuitem" }) as never),
    ).toBe(true)
  })

  test("折りたたみ・サブメニューの開閉、data-keep-menu-open、項目の外は閉じない", () => {
    expect(
      shouldCloseMenuOnClick(
        el("button", { "aria-expanded": "false" }) as never,
      ),
    ).toBe(false)
    expect(
      shouldCloseMenuOnClick(
        el("div", { role: "menuitem", "aria-haspopup": "menu" }) as never,
      ),
    ).toBe(false)
    expect(
      shouldCloseMenuOnClick(
        el("button", {}, el("div", { "data-keep-menu-open": "" })) as never,
      ),
    ).toBe(false)
    expect(shouldCloseMenuOnClick(el("div") as never)).toBe(false)
    expect(shouldCloseMenuOnClick(null)).toBe(false)
  })

  test("onClickCapture に渡すと、閉じるときだけ close を呼ぶ", () => {
    let closed = 0
    const handler = closeMenuOnNavigate(() => {
      closed++
    })
    handler({ target: el("a", { href: "/users/me" }) as never })
    handler({ target: el("div") as never })
    expect(closed).toBe(1)
  })
})
