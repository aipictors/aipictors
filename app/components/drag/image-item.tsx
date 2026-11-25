import { type CSSProperties, forwardRef, type HTMLAttributes } from "react"
import type { TSortableItem } from "~/components/drag/sortable-item"
import { cn } from "~/lib/utils"

type Props = {
  item: TSortableItem
  isOpacityEnabled?: boolean
  isDragging?: boolean
} & HTMLAttributes<HTMLDivElement>

/**
 * 画像アイテム（正方形に切り抜いて表示）
 */
export const ImageItem = forwardRef<HTMLDivElement, Props>(
  ({ item, isOpacityEnabled, isDragging, style, className, ...props }, ref) => {
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
          "size-28 overflow-hidden rounded-xl bg-zinc-700 ring-1 ring-white/10 md:size-32",
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
          className="size-full select-none object-cover"
        />
      </div>
    )
  },
)
