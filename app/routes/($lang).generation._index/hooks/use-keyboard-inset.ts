import { useEffect, useState } from "react"

/**
 * 画面下からこれだけ以上隠れていたらキーボードが出ているとみなす
 */
const keyboardMinHeight = 120

/**
 * 画面のキーボードで隠れている下の高さ（px）と、見えている高さ
 * 下に固定した入力欄をキーボードの上に出すのに使う（iPhone の Safari は固定の要素がキーボードに隠れる）
 */
export function useKeyboardInset() {
  const [state, setState] = useState({ inset: 0, viewportHeight: 0 })

  useEffect(() => {
    const viewport = window.visualViewport
    const update = () => {
      if (!viewport) {
        setState({ inset: 0, viewportHeight: window.innerHeight })
        return
      }
      const hidden = window.innerHeight - viewport.height - viewport.offsetTop
      setState({
        // ピンチで拡大しているときは見える範囲が狭くなるだけなので動かさない
        inset:
          viewport.scale <= 1.05 && hidden > keyboardMinHeight ? hidden : 0,
        viewportHeight: viewport.height,
      })
    }
    update()
    viewport?.addEventListener("resize", update)
    viewport?.addEventListener("scroll", update)
    return () => {
      viewport?.removeEventListener("resize", update)
      viewport?.removeEventListener("scroll", update)
    }
  }, [])

  return state
}
