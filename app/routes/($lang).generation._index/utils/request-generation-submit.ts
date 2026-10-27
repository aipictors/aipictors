import { toast } from "sonner"

/**
 * 画面にある生成ボタン（data-generation-submit）を押す
 * 生成の条件確認やダイアログは生成ボタン側に任せる
 */
export function requestGenerationSubmit() {
  if (typeof document === "undefined") return
  const buttons = Array.from(
    document.querySelectorAll<HTMLButtonElement>(
      "[data-generation-submit] button",
    ),
  )
  const button = buttons.find((element) => element.getClientRects().length > 0)
  if (button === undefined) {
    toast("生成ボタンが見つかりません。画面を更新してください。")
    return
  }
  if (button.disabled) {
    toast("いまは生成できません。少し待ってからお試しください。")
    return
  }
  button.click()
}
