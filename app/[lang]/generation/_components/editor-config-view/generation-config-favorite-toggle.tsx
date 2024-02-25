"use client"

import { Toggle } from "@/components/ui/toggle"
import { StarIcon } from "@radix-ui/react-icons"

type Props = {
  isActive: boolean
}

/**
 * お気に入りモデル一覧表示切替トグル
 * @param props
 * @returns
 */
export const GenerationConfigFavoriteToggle = (props: Props) => {
  return (
    <Toggle>
      <StarIcon className="w-4" />
    </Toggle>
  )
}
