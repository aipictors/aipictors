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

function isTextField(element: Element | null) {
  if (element instanceof HTMLTextAreaElement) return true
  if (element instanceof HTMLInputElement) {
    return !nonTextInputTypes.includes(element.type)
  }
  return element instanceof HTMLElement && element.isContentEditable
}

/**
 * 画面内の文字入力欄を編集中か（スマホではキーボードが出ている）
 */
export function useIsEditingTextField() {
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    const update = () => {
      setIsEditing(isTextField(document.activeElement))
    }
    // focusout の時点ではまだ次の要素にフォーカスが移っていないので少し待つ
    const updateLater = () => {
      requestAnimationFrame(update)
    }
    document.addEventListener("focusin", update)
    document.addEventListener("focusout", updateLater)
    return () => {
      document.removeEventListener("focusin", update)
      document.removeEventListener("focusout", updateLater)
    }
  }, [])

  return isEditing
}
