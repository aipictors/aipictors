import { useState, useEffect, useRef } from "react"
import { AutoResizeTextarea } from "~/components/auto-resize-textarea"
import { Card, CardContent } from "~/components/ui/card"

type Props = {
  label?: string
  caption?: string
  setCaption: (value: string) => void
}

/**
 * キャプション入力
 */
export function PostFormItemCaption (props: Props) {
  const [localCaption, setLocalCaption] = useState(props.caption || "")

  const isFilled = localCaption.trim() !== ""

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value
    setLocalCaption(value)

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current) // 前回のタイマーをクリア
    }

    // デバウンス処理 (300ms)
    timeoutRef.current = setTimeout(() => {
      props.setCaption(value)
    }, 300)
  }

  // props.valueが更新されたらlocalValueも更新する
  useEffect(() => {
    setLocalCaption(props.caption || "")
  }, [props.caption])

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <p className="font-bold text-sm">
          {props.label ? props.label : "キャプション（任意）"}
        </p>
        <AutoResizeTextarea
          onChange={handleChange}
          value={localCaption}
          maxLength={3000}
          placeholder={props.label ? props.label : "キャプション"}
          className={`w-full ${
            isFilled ? "border-green-500" : "border-gray-300"
          }`}
        />
      </CardContent>
    </Card>
  )
}
