import { Textarea } from "@/_components/ui/textarea"
import { forwardRef, useState, useEffect } from "react"

type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement>

/**
 * 自動リサイズのテキストエリア
 */
export const AutoResizeTextarea = forwardRef<HTMLTextAreaElement, Props>(
  (props, ref) => {
    // テキストエリアの高さを状態として保持
    const [textAreaHeight, setTextAreaHeight] = useState("auto")

    // テキストエリアの内容が変わった際に高さを調整する処理
    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const target = e.target
      // 高さを一時的に小さくしてスクロールバーをリセット
      target.style.height = "auto"
      // 新しいスクロール高さに基づいて高さを設定
      const updatedHeight = `${target.scrollHeight}px`
      setTextAreaHeight(updatedHeight)
      target.style.height = updatedHeight
    }

    useEffect(() => {
      if (ref && "current" in ref && ref.current) {
        ref.current.style.height = "auto"
        setTextAreaHeight(`${ref.current.scrollHeight}px`)
      }
    }, [ref])

    return (
      <Textarea
        ref={ref}
        {...props}
        style={{
          ...props.style,
          minHeight: "unset",
          overflow: "hidden",
          resize: "none",
          height: textAreaHeight,
        }}
        onInput={handleInput}
      />
    )
  },
)

AutoResizeTextarea.displayName = "AutoResizeTextarea"
