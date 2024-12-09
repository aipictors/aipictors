import { Input } from "~/components/ui/input"
import { Card, CardContent } from "~/components/ui/card"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import { useState, useEffect, useRef } from "react"

type Props = {
  label?: string
  onChange: (value: string) => void
  value?: string
}

/**
 * タイトル入力
 */
export function PostFormItemTitle(props: Props) {
  const [localValue, setLocalValue] = useState(props.value || "")

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isFilled = localValue.trim() !== ""

  const t = useTranslation()

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setLocalValue(value)

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current) // 前回のタイマーをクリア
    }

    // デバウンス処理 (300ms)
    timeoutRef.current = setTimeout(() => {
      props.onChange(value)
    }, 300)
  }

  // props.valueが更新されたらlocalValueも更新する
  useEffect(() => {
    setLocalValue(props.value || "")
  }, [props.value])

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
          {props.label
            ? props.label
            : t("タイトル（必須）", "Title (Required)")}
        </p>
        <Input
          onChange={handleChange}
          value={localValue}
          minLength={1}
          maxLength={120}
          required
          type="text"
          name="title"
          placeholder={props.label ? props.label : t("タイトル", "Title")}
          className={cn("w-full", {
            "border-green-500": isFilled,
            "border-gray-300": !isFilled,
          })}
        />
      </CardContent>
    </Card>
  )
}
