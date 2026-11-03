import { useSortable } from "@dnd-kit/sortable"
import { RefreshCwIcon, XIcon } from "lucide-react"
import { type HTMLAttributes, useState } from "react"
import { FileNameLabel } from "~/components/drag/file-name-label"
import { ImageItem } from "~/components/drag/image-item"
import { Button } from "~/components/ui/button"

// ドラッグ可能なアイテムの型
export type TSortableItem = {
  id: number
  content: string | null // 画像のURLなど
  isContentEdited?: boolean // コンテンツが編集されたかどうか
  fileName?: string | null // アップロードしたファイルの名前（並べ替えの目印。投稿には含めない）
  generationNanoid?: string | null // 生成履歴から選んだ画像の nanoid（生成履歴の「投稿済み」の印に使う）
}

type Props = {
  item: TSortableItem
  /** 何枚目か（1 枚だけのときは出さない） */
  position?: number
  onRenameFile?: (fileName: string) => void
  /** この画像だけ別の画像に入れ替える（順番はそのまま） */
  onReplace?: (id: number) => void
  isDeletable?: boolean
  onDelete?: (id: number) => void
  optionalButton?: React.ReactNode
  onClickOptionButton?: (id: number) => void
} & HTMLAttributes<HTMLDivElement>

/**
 * ドラッグ可能なアイテム
 * @param props
 */
export function SortableItem({
  item,
  position,
  onRenameFile,
  onReplace,
  ...props
}: Props): React.ReactNode {
  const [isDeleted, _setIsDeleted] = useState(false)

  const { attributes, isDragging, listeners, setNodeRef } = useSortable({
    id: item.id,
  })

  if (!item.content || isDeleted) {
    return null
  }

  const style = {
    opacity: isDragging ? 0.5 : 1, // ドラッグ時に透明度を変更
  }

  return (
    <div className="w-24 md:w-32">
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
        {position !== undefined && (
          <span className="pointer-events-none absolute top-2 left-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-black/70 px-1 font-medium text-[11px] text-white leading-none">
            {position}
          </span>
        )}
        {props.isDeletable && (
          <Button
            className="absolute top-2 right-2 size-6 md:h-8 md:w-8"
            size={"icon"}
            title="この画像を外す"
            aria-label="この画像を外す"
            onClick={() => {
              if (props.onDelete) {
                props.onDelete(item.id)
              }
              // setIsDeleted(true)
            }}
          >
            <XIcon className="size-4 md:h-6 md:w-6" />
          </Button>
        )}
        {onReplace && (
          <Button
            type="button"
            className="absolute right-2 bottom-2 size-6 md:h-8 md:w-8"
            size={"icon"}
            title="この画像を差し替える"
            aria-label="この画像を差し替える"
            onClick={() => onReplace(item.id)}
          >
            <RefreshCwIcon className="size-4 md:h-5 md:w-5" />
          </Button>
        )}
        {props.optionalButton && (
          // biome-ignore lint/complexity/useOptionalChain: Intentional (readability)
          // biome-ignore lint/a11y/useKeyWithClickEvents: Legacy UI (click-only)
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
      {item.fileName && (
        <FileNameLabel fileName={item.fileName} onRename={onRenameFile} />
      )}
    </div>
  )
}
