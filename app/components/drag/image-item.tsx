import { type CSSProperties, forwardRef, type HTMLAttributes } from "react"
import type { TSortableItem } from "~/components/drag/sortable-item"
import { cn } from "~/lib/utils"

type Props = {
  item: TSortableItem
  isOpacityEnabled?: boolean
  isDragging?: boolean
  /** 並べた枠の幅いっぱいの正方形にする（なければ 112px、PC は 128px） */
  size?: number
  /** 切り抜かずに画像全体を枠の中に収める（サムネを「元の比率」で見る） */
  isOriginalRatio?: boolean
} & HTMLAttributes<HTMLDivElement>

/**
 * 画像アイテム（正方形に切り抜いて表示。isOriginalRatio なら全体を収める）
 */
export const ImageItem = forwardRef<HTMLDivElement, Props>(
  (
    {
      item,
      isOpacityEnabled,
      isDragging,
      size,
      isOriginalRatio,
      style,
      className,
      ...props
    },
    ref,
  ) => {
    if (!item.content) {
      return null
    }

    const styles: CSSProperties = {
      opacity: isOpacityEnabled ? 0.4 : 1,
      cursor: isDragging ? "grabbing" : "grab",
      ...style,
    }

    return (
      <div
        ref={ref}
        style={styles}
        className={cn(
          "overflow-hidden rounded-xl bg-zinc-700 ring-1 ring-white/10",
          size ? "aspect-square w-full" : "size-28 md:size-32",
          isDragging && "scale-105 shadow-2xl ring-2 ring-blue-400",
          className,
        )}
        {...props}
      >
        <img
          draggable={false}
          src={item.content}
          alt=""
          decoding="async"
          className={cn(
            "size-full select-none [-webkit-touch-callout:none]",
            isOriginalRatio ? "object-contain" : "object-cover",
          )}
        />
      </div>
    )
  },
)
