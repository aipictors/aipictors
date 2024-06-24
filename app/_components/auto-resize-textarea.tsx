import { Textarea } from "@/_components/ui/textarea"
import { forwardRef, useState, useEffect, useCallback, useRef } from "react"

type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  minHeight?: string
}

/**
 * 自動リサイズのテキストエリア
 */
export const AutoResizeTextarea = forwardRef<HTMLTextAreaElement, Props>(
  (props, ref) => {
    const { minHeight = "auto", value, ...rest } = props

    // テキストエリアの高さを状態として保持
    const [textAreaHeight, setTextAreaHeight] = useState("auto")

    const textAreaRef = useRef<HTMLTextAreaElement | null>(null)
    const prevValueRef = useRef<string | undefined>(undefined)

    const combinedRef = useCallback(
      (node: HTMLTextAreaElement) => {
        // `ref` が関数であれば呼び出す
        if (typeof ref === "function") {
          ref(node)
        } else if (ref) {
          // `ref` がオブジェクトであれば current プロパティを設定
          ;(ref as React.MutableRefObject<HTMLTextAreaElement | null>).current =
            node
        }
        textAreaRef.current = node
      },
      [ref],
    )

    // 高さを調整する関数
    const adjustHeight = useCallback((element: HTMLTextAreaElement | null) => {
      if (element) {
        element.style.height = "auto"
        const updatedHeight = `${element.scrollHeight}px`
        setTextAreaHeight(updatedHeight)
        element.style.height = updatedHeight
      }
    }, [])

    // テキストエリアの内容が変わった際に高さを調整する処理
    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      adjustHeight(e.target)
    }

    // refが設定されたときやvalueが変わったときに高さを調整
    useEffect(() => {
      if (textAreaRef.current && prevValueRef.current !== String(value)) {
        adjustHeight(textAreaRef.current)
        prevValueRef.current = String(value)
      }
    }, [value, adjustHeight, textAreaHeight])

    return (
      <Textarea
        ref={combinedRef}
        {...rest}
        value={value}
        style={{
          ...props.style,
          minHeight: minHeight,
          resize: "none",
          cursor: "text",
          height: textAreaHeight,
        }}
        onChange={(e) => {
          props.onChange?.(e)
          handleInput(e)
        }}
        onInput={handleInput}
      />
    )
  },
)

AutoResizeTextarea.displayName = "AutoResizeTextarea"
