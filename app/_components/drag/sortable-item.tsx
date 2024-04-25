import ImageItem from "@/_components/drag/image-item"
import { Button } from "@/_components/ui/button"
import { useSortable } from "@dnd-kit/sortable"
import { useState, type HTMLAttributes } from "react"

// ドラッグ可能なアイテムの型
export type TSortableItem = {
  id: number
  content: string // 画像のURLなど
}

type Props = {
  item: TSortableItem
  isDeletable?: boolean
  onDelete?: (id: number) => void
} & HTMLAttributes<HTMLDivElement>

/**
 * ドラッグ可能なアイテム
 * @param props
 */
const SortableItem = ({ item, ...props }: Props) => {
  if (!item.content) {
    return null
  }

  const [isDeleted, setIsDeleted] = useState(false)

  if (isDeleted) {
    return null
  }

  const { attributes, isDragging, listeners, setNodeRef } = useSortable({
    id: item.id,
  })

  const style = {
    opacity: isDragging ? 0.5 : 1, // ドラッグ時に透明度を変更
  }

  return (
    <div className="relative">
      <div
        className="relative"
        ref={setNodeRef}
        style={{ ...style, ...props.style }} // 既存のスタイルプロップとマージ
        {...attributes}
        {...listeners}
        {...props} // propsをスプレッドして他の属性を適用
      >
        <ImageItem item={item} />
        <Button
          onClick={() => {
            if (props.onDelete) {
              props.onDelete(item.id)
            }
            setIsDeleted(true)
          }}
          className="absolute top-1 right-1 z-1"
        >
          x
        </Button>
      </div>
      <Button
        onClick={() => {
          if (props.onDelete) {
            props.onDelete(item.id)
          }
          setIsDeleted(true)
        }}
        className="absolute top-1 right-1 z-1"
      >
        x
      </Button>
    </div>
  )
}

export default SortableItem
