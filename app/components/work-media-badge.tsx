import { Play, Sparkles } from "lucide-react"
import { cn } from "~/lib/utils"

type Props = {
  isPromptPublic?: boolean
  hasVideoUrl?: boolean
  isGeneration?: boolean
  className?: string
  size?: "sm" | "md" | "lg"
  hasReferenceButton?: boolean
}

/**
 * 作品のメディア種別やプロンプト公開状態を示すバッジ
 * 参照生成ボタンがある場合は位置を調整します
 */
export function WorkMediaBadge (props: Props): React.ReactNode {
  const {
    isPromptPublic = false,
    hasVideoUrl = false,
    isGeneration = false,
    className,
    size = "md",
  } = props

  if (!isPromptPublic && !hasVideoUrl && !isGeneration) {
    return null
  }

  const badgeSize = {
    sm: "size-4",
    md: "size-5",
    lg: "size-6",
  }[size]

  const iconSize = {
    sm: "size-2.5",
    md: "size-3",
    lg: "size-4",
  }[size]

  const textSize = {
    sm: "text-xs",
    md: "text-xs",
    lg: "text-sm",
  }[size]

  return (
    <div className={cn("flex space-x-1", className)}>
      {/* Aipictors生成バッジ */}
      {isGeneration && (
        <div
          className={cn(
            "flex items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm backdrop-blur-sm",
            badgeSize,
          )}
          title="Aipictors生成作品"
        >
          <Sparkles className={cn("fill-white", iconSize)} />
        </div>
      )}

      {/* プロンプト公開バッジ（生成作品以外） */}
      {isPromptPublic && !isGeneration && (
        <div
          className={cn(
            "flex items-center justify-center rounded-full bg-blue-600/80 text-white backdrop-blur-sm",
            badgeSize,
          )}
          title="プロンプト公開作品"
        >
          <span className={cn("font-bold", textSize)}>P</span>
        </div>
      )}

      {/* 動画再生バッジ */}
      {hasVideoUrl && (
        <div
          className={cn(
            "flex items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm",
            badgeSize,
          )}
          title="動画作品"
        >
          <Play className={cn("fill-white", iconSize)} />
        </div>
      )}
    </div>
  )
}
