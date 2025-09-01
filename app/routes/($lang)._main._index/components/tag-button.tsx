import { Link } from "@remix-run/react"
import { cn } from "~/lib/utils"
import { stringToColor } from "~/utils/string-to-color"

type Props = {
  name: string
  title?: string
  link: string
  isDisabled?: boolean
  isTagName?: boolean
  border?: boolean
}

export function TagButton(props: Props) {
  const isSelected = props.border

  const buttonContent = (
    <div
      className={cn(
        "group relative overflow-hidden rounded-full px-6 py-3 text-center transition-all duration-300",
        isSelected
          ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-background"
          : "hover:scale-105",
        props.isDisabled ? "cursor-default" : "cursor-pointer",
      )}
      style={{
        background: isSelected
          ? `linear-gradient(135deg, ${stringToColor(props.name, false)}, ${stringToColor(`${props.name}2`, false)})`
          : stringToColor(props.name, props.isDisabled ?? false),
      }}
    >
      {/* グラデーションオーバーレイ */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 transition-opacity duration-300",
          !props.isDisabled && "group-hover:opacity-100",
        )}
      />

      {/* 選択インジケーター */}
      {isSelected && (
        <div className="absolute top-1 right-1 h-2 w-2 animate-pulse rounded-full bg-white" />
      )}

      <div className="relative z-10">
        {props.title && (
          <div className="mb-1 font-semibold text-white text-xs opacity-90">
            {props.title}
          </div>
        )}
        <div
          className={cn(
            "font-bold text-white",
            props.title ? "text-sm" : "text-base",
          )}
        >
          {props.name}
        </div>
      </div>
    </div>
  )

  return props.isDisabled ? (
    buttonContent
  ) : (
    <Link to={`${props.link}`}>{buttonContent}</Link>
  )
}
