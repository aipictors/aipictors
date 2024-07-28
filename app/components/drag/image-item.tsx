import type { TSortableItem } from "@/components/drag/sortable-item"
import { forwardRef, type CSSProperties, type HTMLAttributes } from "react"

type Props = {
  item: TSortableItem
  isOpacityEnabled?: boolean
  isDragging?: boolean
} & HTMLAttributes<HTMLDivElement>

/**
 * 画像アイテム
 */
export const ImageItem = forwardRef<HTMLDivElement, Props>(
  ({ item, isOpacityEnabled, isDragging, style, ...props }, ref) => {
    if (!item.content) {
      return null
    }

    const styles: CSSProperties = {
      opacity: isOpacityEnabled ? "0.4" : "1",
      cursor: isDragging ? "grabbing" : "grab",
      lineHeight: "0.5",
      transform: isDragging ? "scale(1.05)" : "scale(1)",
      ...style,
    }

    return (
      <div ref={ref} style={styles} {...props}>
        <img
          draggable={false}
          src={item.content}
          alt={`${item.id}`}
          className="h-24 w-24 object-fill md:h-32 md:w-32"
          style={{
            borderRadius: "8px",
            boxShadow: isDragging
              ? "none"
              : "rgb(63 63 68 / 5%) 0px 0px 0px 1px, rgb(34 33 81 / 15%) 0px 1px 3px 0px",
            maxWidth: "100%",
            objectFit: "cover",
          }}
        />
      </div>
    )
  },
)
