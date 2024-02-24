"use client"

import { Toggle } from "@/components/ui/toggle"
import { StarIcon } from "@radix-ui/react-icons"

type Props = {
  isActive: boolean
  onToggleShowFavorite(): void
}

/**
 * お気に入りモデル一覧表示切替トグル
 * @param props
 * @returns
 */
export const GenerationEditorConfigOpenFavoriteModelToggle = (props: Props) => {
  return (
    <Toggle
      className="w-40"
      onClick={props.onToggleShowFavorite}
      variant="outline"
      size={"sm"}
    >
      <StarIcon className="w-4" />
      {props.isActive ? "すべて" : "お気に入り"}
    </Toggle>
  )
}
