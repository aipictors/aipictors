import { KeyCodes } from "~/config"

/**
 * いいねのショートカット（F）として扱うキー入力か判定する
 * 文字入力中や Ctrl+F などのブラウザ操作ではいいねしない
 */
export function isLikeShortcutKeyEvent(
  event: Pick<
    KeyboardEvent,
    | "code"
    | "ctrlKey"
    | "metaKey"
    | "altKey"
    | "shiftKey"
    | "repeat"
    | "isComposing"
    | "target"
  >,
): boolean {
  if (event.code !== KeyCodes.F) return false
  if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) {
    return false
  }
  if (event.repeat || event.isComposing) return false

  const target = event.target as {
    tagName?: string
    isContentEditable?: boolean
  } | null
  const tagName = target?.tagName?.toLowerCase()
  if (tagName === "input" || tagName === "textarea" || tagName === "select") {
    return false
  }
  return target?.isContentEditable !== true
}
