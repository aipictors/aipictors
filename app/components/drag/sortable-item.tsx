import { ImageItem } from "~/components/drag/image-item"
import { Button } from "~/components/ui/button"
import { useSortable } from "@dnd-kit/sortable"
import { XIcon } from "lucide-react"
import { useState, type HTMLAttributes } from "react"

// ドラッグ可能なアイテムの型
export type TSortableItem = {
  id: number
  content: string | null // 画像のURLなど
  isContentEdited?: boolean // コンテンツが編集されたかどうか
}

type Props = {
  item: TSortableItem
  isDeletable?: boolean
  onDelete?: (id: number) => void
  optionalButton?: React.ReactNode
  onClickOptionButton?: (id: number) => void
} & HTMLAttributes<HTMLDivElement>

/**
 * ドラッグ可能なアイテム
 * @param props
 */
export const SortableItem = ({ item, ...props }: Props) => {
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
      </div>
      {props.isDeletable && (
        <Button
          className="absolute top-2 right-2 h-6 w-6 md:h-8 md:w-8"
          size={"icon"}
          onClick={() => {
            if (props.onDelete) {
              props.onDelete(item.id)
            }
            // setIsDeleted(true)
          }}
        >
          <XIcon className="h-4 w-4 md:h-6 md:w-6" />
        </Button>
      )}
      {props.optionalButton && (
        // biome-ignore lint/complexity/useOptionalChain: <explanation>
        // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
        <div
          onClick={() => {
            if (props.onClickOptionButton) {
              props.onClickOptionButton(item.id)
            }
          }}
          className="absolute bottom-2 left-2"
        >
          {props.optionalButton}
        </div>
      )}
    </div>
  )
}
