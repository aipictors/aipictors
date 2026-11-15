/**
 * メニューの中のリンクやボタンを押したらメニューを閉じるか
 * 開閉するもの（サブメニュー・折りたたみ・テーマの選択など aria-expanded / aria-haspopup を持つもの）と、
 * data-keep-menu-open を付けた要素では閉じない
 */
export const shouldCloseMenuOnClick = (target: EventTarget | null): boolean => {
  if (!target || typeof (target as Element).closest !== "function") return false
  const element = (target as Element).closest(
    "a[href], button, [role='menuitem']",
  )
  if (!element) return false
  if (element.closest("[data-keep-menu-open]")) return false
  if (
    element.hasAttribute("aria-expanded") ||
    element.hasAttribute("aria-haspopup")
  )
    return false
  return true
}

/** onClickCapture に渡す（押したのがリンク・ボタンなら close を呼ぶ） */
export const closeMenuOnNavigate =
  (close: () => void) => (event: { target: EventTarget | null }) => {
    if (shouldCloseMenuOnClick(event.target)) close()
  }
