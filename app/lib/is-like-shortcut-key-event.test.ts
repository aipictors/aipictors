import { describe, expect, test } from "bun:test"
import { isLikeShortcutKeyEvent } from "~/lib/is-like-shortcut-key-event"

const base = {
  code: "KeyF",
  ctrlKey: false,
  metaKey: false,
  altKey: false,
  shiftKey: false,
  repeat: false,
  isComposing: false,
  target: { tagName: "BODY" } as unknown as EventTarget,
}

describe("isLikeShortcutKeyEvent", () => {
  test("ページ上の F だけを受け付ける", () => {
    expect(isLikeShortcutKeyEvent(base)).toBe(true)
    expect(isLikeShortcutKeyEvent({ ...base, code: "KeyG" })).toBe(false)
  })

  test("Ctrl+F などの修飾キー付きは受け付けない", () => {
    expect(isLikeShortcutKeyEvent({ ...base, ctrlKey: true })).toBe(false)
    expect(isLikeShortcutKeyEvent({ ...base, metaKey: true })).toBe(false)
  })

  test("文字入力中と長押しは受け付けない", () => {
    for (const tagName of ["INPUT", "TEXTAREA", "SELECT"]) {
      const target = { tagName } as unknown as EventTarget
      expect(isLikeShortcutKeyEvent({ ...base, target })).toBe(false)
    }
    const editor = {
      tagName: "DIV",
      isContentEditable: true,
    } as unknown as EventTarget
    expect(isLikeShortcutKeyEvent({ ...base, target: editor })).toBe(false)
    expect(isLikeShortcutKeyEvent({ ...base, isComposing: true })).toBe(false)
    expect(isLikeShortcutKeyEvent({ ...base, repeat: true })).toBe(false)
  })
})
