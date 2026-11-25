import { useSortable } from "@dnd-kit/sortable"
import { RefreshCwIcon, XIcon } from "lucide-react"
import { type HTMLAttributes, memo } from "react"
import { FileNameLabel } from "~/components/drag/file-name-label"
import { ImageItem } from "~/components/drag/image-item"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"

// ドラッグ可能なアイテムの型
export type TSortableItem = {
  id: number
  content: string | null // 画像のURLなど
  isContentEdited?: boolean // コンテンツが編集されたかどうか
  fileName?: string | null // アップロードしたファイルの名前（並べ替えの目印。投稿には含めない）
  generationNanoid?: string | null // 生成履歴から選んだ画像の nanoid（生成履歴の「投稿済み」の印に使う）
  /** 投稿画面でかけたモザイク。content はかけた後の画像で、元の画像・範囲（PNG）・種類・濃さを持っておく */
  mosaic?: {
    source: string
    /** 範囲（PNG の data URL）。空文字はモザイクを全部外したとき */
    mask: string
    style: "mosaic" | "black" | "white" | "blur"
    strength: number
    /** 自動でかけたまま（手で直していない） */
    isAuto: boolean
  } | null
}

type Props = {
  item: TSortableItem
  /** 何枚目か（1 枚だけのときは出さない） */
  position?: number
  onRenameFile?: (id: number, fileName: string) => void
  /** この画像だけ別の画像に入れ替える（順番はそのまま） */
  onReplace?: (id: number) => void
  isDeletable?: boolean
  onDelete?: (id: number) => void
  /** 左下のボタン（モザイク・描き込みなど）の中身 */
  optionalButton?: React.ReactNode
  optionalButtonLabel?: string
  onClickOptionButton?: (id: number) => void
  /** 画像の下に出す小さな表示（自動モザイクの状態など） */
  footer?: React.ReactNode
} & Omit<HTMLAttributes<HTMLDivElement>, "onClick">

/** 画像の上のボタン（四隅で同じ大きさ・同じ見た目にそろえる） */
export const imageOverlayButtonClassName =
  "absolute flex size-8 items-center justify-center rounded-full bg-black/60 text-white shadow-md ring-1 ring-white/20 backdrop-blur-sm transition hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 active:scale-95"

/**
 * ドラッグ可能なアイテム
 * 並べ替え中は CSS の transform で動かすだけにして、投稿フォームの状態は離したときに 1 回だけ変える
 */
export const SortableItem = memo(function SortableItem({
  item,
  position,
  onRenameFile,
  onReplace,
  isDeletable,
  onDelete,
  optionalButton,
  optionalButtonLabel,
  onClickOptionButton,
  footer,
  className,
  style,
  ...props
}: Props): React.ReactNode {
  const t = useTranslation()
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: item.id })

  if (!item.content) {
    return null
  }

  return (
    <div
      ref={setNodeRef}
      className="w-28 md:w-32"
      style={{
        transform: transform
          ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
          : undefined,
        transition,
        opacity: isDragging ? 0.35 : 1,
        zIndex: isDragging ? 1 : undefined,
      }}
    >
      <div className="relative">
        <div
          className={cn("touch-none", className)}
          style={style}
          {...attributes}
          {...listeners}
          {...props}
        >
          <ImageItem item={item} />
        </div>
        {position !== undefined && (
          <span className="pointer-events-none absolute top-1.5 left-1.5 flex size-8 items-center justify-center rounded-full bg-black/60 font-bold text-white text-xs shadow-md ring-1 ring-white/20 backdrop-blur-sm">
            {position}
          </span>
        )}
        {isDeletable && (
          <button
            type="button"
            className={cn(imageOverlayButtonClassName, "top-1.5 right-1.5")}
            title={t("この画像を外す", "Remove this image")}
            aria-label={t("この画像を外す", "Remove this image")}
            onClick={() => onDelete?.(item.id)}
          >
            <XIcon className="size-4" />
          </button>
        )}
        {optionalButton && (
          <button
            type="button"
            className={cn(imageOverlayButtonClassName, "bottom-1.5 left-1.5")}
            title={optionalButtonLabel}
            aria-label={optionalButtonLabel}
            onClick={() => onClickOptionButton?.(item.id)}
          >
            {optionalButton}
          </button>
        )}
        {onReplace && (
          <button
            type="button"
            className={cn(imageOverlayButtonClassName, "right-1.5 bottom-1.5")}
            title={t("この画像を差し替える", "Replace this image")}
            aria-label={t("この画像を差し替える", "Replace this image")}
            onClick={() => onReplace(item.id)}
          >
            <RefreshCwIcon className="size-4" />
          </button>
        )}
      </div>
      {footer}
      {item.fileName && (
        <FileNameLabel
          fileName={item.fileName}
          onRename={
            onRenameFile
              ? (fileName) => onRenameFile(item.id, fileName)
              : undefined
          }
        />
      )}
    </div>
  )
})
