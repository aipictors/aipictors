"use client"

import { Toggle } from "@/components/ui/toggle"
import { cn } from "@/lib/utils"
import { StarIcon } from "lucide-react"

type Props = {
  isActive: boolean
  onToggleShowFavorite(): void
}

/**
 * お気に入りモデル一覧表示切替トグル
 * @param props
 * @returns
 */
export const GenerationConfigFavoriteModelToggle = (props: Props) => {
  return (
    <Toggle
      className="w-16"
      onClick={props.onToggleShowFavorite}
      variant="outline"
      size={"sm"}
    >
      <StarIcon
        className={cn(props.isActive ? "w-4 fill-yellow-500" : "w-4")}
      />
    </Toggle>
  )
}
