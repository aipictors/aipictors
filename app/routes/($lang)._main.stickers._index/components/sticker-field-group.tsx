import type { ReactNode } from "react"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"

/**
 * 設定の置き場所。PC は右の列（sidebar）、スマホはタブの中（tabs）
 */
export type StickerPanelLayout = "sidebar" | "tabs"

/**
 * タブの中では横に並べ、右の列では縦に積む
 */
export function StickerFieldGroup(props: {
  layout: StickerPanelLayout
  children: ReactNode
}) {
  if (props.layout === "tabs") {
    return <div className="grid gap-3 sm:grid-cols-2">{props.children}</div>
  }
  return <>{props.children}</>
}

/**
 * スライダーと数値の入力を並べた欄
 */
export function StickerRangeField(props: {
  label: string
  min: number
  max: number
  step: number
  value: number
  onChange: (value: number) => void
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{props.label}</Label>
      <div className="flex items-center gap-2">
        <Input
          type="range"
          min={props.min}
          max={props.max}
          step={props.step}
          value={props.value}
          onChange={(event) => props.onChange(Number(event.target.value))}
        />
        <Input
          type="number"
          min={props.min}
          max={props.max}
          step={props.step}
          value={props.value}
          onChange={(event) => props.onChange(Number(event.target.value))}
          className="w-20"
        />
      </div>
    </div>
  )
}
