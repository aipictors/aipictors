import { useEffect, useState } from "react"

const nonTextInputTypes = [
  "button",
  "checkbox",
  "color",
  "file",
  "hidden",
  "image",
  "radio",
  "range",
  "reset",
  "submit",
]

/**
 * 画面下からこれだけ以上隠れていたらキーボードが出ているとみなす
 */
const keyboardMinHeight = 120

function isTextField(element: Element | null) {
  if (element instanceof HTMLTextAreaElement) return true
  if (element instanceof HTMLInputElement) {
    return !nonTextInputTypes.includes(element.type)
  }
  return element instanceof HTMLElement && element.isContentEditable
}

/**
 * 画面上のキーボードが出ているか
 * Android の戻るボタンなどでキーボードだけ閉じると、入力欄にフォーカスが残るのでフォーカスだけでは判断しない
 */
function isKeyboardVisible() {
  const viewport = window.visualViewport
  // visualViewport が無いブラウザはフォーカスで判断する
  if (!viewport) return true
  // ピンチで拡大しているときは見える範囲が狭くなるだけなので判断しない
  if (viewport.scale > 1.05) return true
  return window.innerHeight - viewport.height > keyboardMinHeight
}

/**
 * 画面内の文字入力欄を編集中で、キーボードが出ているか（スマホ）
 */
export function useIsEditingTextField() {
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    const update = () => {
      setIsEditing(isTextField(document.activeElement) && isKeyboardVisible())
    }
    // focusout の時点ではまだ次の要素にフォーカスが移っていないので少し待つ
    const updateLater = () => {
      requestAnimationFrame(update)
    }
    document.addEventListener("focusin", updateLater)
    document.addEventListener("focusout", updateLater)
    // キーボードの開閉は見える範囲の大きさの変化で知る（開く途中は何度か届く）
    window.visualViewport?.addEventListener("resize", update)
    return () => {
      document.removeEventListener("focusin", updateLater)
      document.removeEventListener("focusout", updateLater)
      window.visualViewport?.removeEventListener("resize", update)
    }
  }, [])

  return isEditing
}
