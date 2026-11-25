import { useSortable } from "@dnd-kit/sortable"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  GripIcon,
  RefreshCwIcon,
  XIcon,
} from "lucide-react"
import { type HTMLAttributes, memo } from "react"
import { FileNameLabel } from "~/components/drag/file-name-label"
import { ImageItem } from "~/components/drag/image-item"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"

// ドラッグ可能なアイテムの型
export type TSortableItem = {
  id: number
  /** 並べ替えても変わらない目印（toSortableKey で付ける。投稿には含めない） */
  sortKey?: string
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
  /** 並べ替えても変わらない目印（ドラッグの id） */
  sortKey: string
  /** 1 辺の大きさの目安（px。実際は列の幅いっぱい）。ボタンの大きさを決める */
  size: number
  /** 何枚目か（1 枚だけのときは出さない） */
  position?: number
  /** 並べ替えモード（どこを触ってもすぐ動かせる。◀ ▶ を出し、ほかのボタンは隠す） */
  isReorderMode?: boolean
  isFirst?: boolean
  isLast?: boolean
  /** 1 つ前（-1）・後ろ（1）へ動かす */
  onMove?: (id: number, offset: -1 | 1) => void
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
  "absolute flex items-center justify-center rounded-full bg-black/60 text-white shadow-md ring-1 ring-white/20 backdrop-blur-sm transition hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 active:scale-95"

/**
 * 画像の大きさに合わせたボタンの大きさ。小さい画像では画像が隠れないようにボタンを小さくし、
 * いちばん小さいときは外すボタンだけにする（直す・差し替えは大きくすると出る）
 */
export const toOverlayButtonSize = (size: number) => {
  if (size >= 112) {
    return {
      button: "size-8",
      icon: "size-4",
      top: "top-1.5",
      bottom: "bottom-1.5",
      left: "left-1.5",
      right: "right-1.5",
      isCompact: false,
    }
  }
  if (size >= 76) {
    return {
      button: "size-6",
      icon: "size-3.5",
      top: "top-1",
      bottom: "bottom-1",
      left: "left-1",
      right: "right-1",
      isCompact: false,
    }
  }
  return {
    button: "size-5",
    icon: "size-3",
    top: "top-0.5",
    bottom: "bottom-0.5",
    left: "left-0.5",
    right: "right-0.5",
    isCompact: true,
  }
}

/**
 * ドラッグ可能なアイテム
 * 並べ替え中は CSS の transform で動かすだけにして、投稿フォームの状態は離したときに 1 回だけ変える
 */
/** 並びが変わったときに周りの画像が動く速さ（短く・最後をゆっくり） */
const SORT_TRANSITION = {
  duration: 200,
  easing: "cubic-bezier(0.2, 0, 0, 1)",
}

export const SortableItem = memo(function SortableItem({
  item,
  sortKey,
  size,
  position,
  isReorderMode = false,
  isFirst,
  isLast,
  onMove,
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
    isSorting,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: sortKey, transition: SORT_TRANSITION })

  if (!item.content) {
    return null
  }

  const buttonSize = toOverlayButtonSize(size)
  const insetTop = buttonSize.top
  const insetBottom = buttonSize.bottom
  const insetLeft = buttonSize.left
  const insetRight = buttonSize.right
  const buttonClassName = cn(imageOverlayButtonClassName, buttonSize.button)

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: transform
          ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
          : undefined,
        transition,
      }}
    >
      <div className="relative">
        {/* 持ち上げている間は、置く場所を点線の枠で見せる */}
        {isDragging && (
          <div className="pointer-events-none absolute inset-0 z-10 rounded-xl border-2 border-blue-400 border-dashed bg-blue-500/15" />
        )}
        <div
          // ふだんは画像の上でもスクロールできるようにする（並べ替えモードだけ触ってすぐ動かす）
          className={cn(
            "select-none",
            isReorderMode ? "touch-none" : "touch-manipulation",
            isReorderMode &&
              "rounded-xl ring-2 ring-blue-400/70 ring-offset-1 ring-offset-transparent",
            isDragging && "opacity-30",
            className,
          )}
          style={style}
          {...attributes}
          {...listeners}
          {...props}
        >
          <ImageItem item={item} size={size} />
        </div>
        {/* 動かしている間は番号が実際の並びとずれるので隠す */}
        {position !== undefined && !isSorting && (
          <span
            className={cn(
              "pointer-events-none absolute flex items-center justify-center rounded-full bg-black/60 font-bold text-white shadow-md ring-1 ring-white/20 backdrop-blur-sm",
              buttonSize.button,
              buttonSize.isCompact ? "text-[10px]" : "text-xs",
              insetTop,
              insetLeft,
            )}
          >
            {position}
          </span>
        )}
        {isDragging ? null : isReorderMode ? (
          <>
            <span
              className={cn(
                "pointer-events-none absolute flex items-center justify-center rounded-full bg-blue-500/90 text-white shadow-md",
                buttonSize.button,
                insetTop,
                insetRight,
              )}
            >
              <GripIcon className={buttonSize.icon} />
            </span>
            <div
              className={cn(
                "absolute inset-x-0 flex justify-between px-1",
                insetBottom,
              )}
            >
              <button
                type="button"
                className={cn(buttonClassName, "static disabled:opacity-30")}
                disabled={isFirst}
                title={t("前へ", "Move earlier")}
                aria-label={t("前へ", "Move earlier")}
                onClick={() => onMove?.(item.id, -1)}
              >
                <ChevronLeftIcon className={buttonSize.icon} />
              </button>
              <button
                type="button"
                className={cn(buttonClassName, "static disabled:opacity-30")}
                disabled={isLast}
                title={t("後ろへ", "Move later")}
                aria-label={t("後ろへ", "Move later")}
                onClick={() => onMove?.(item.id, 1)}
              >
                <ChevronRightIcon className={buttonSize.icon} />
              </button>
            </div>
          </>
        ) : (
          <>
            {isDeletable && (
              <button
                type="button"
                className={cn(buttonClassName, insetTop, insetRight)}
                title={t("この画像を外す", "Remove this image")}
                aria-label={t("この画像を外す", "Remove this image")}
                onClick={() => onDelete?.(item.id)}
              >
                <XIcon className={buttonSize.icon} />
              </button>
            )}
            {optionalButton && !buttonSize.isCompact && (
              <button
                type="button"
                className={cn(buttonClassName, insetBottom, insetLeft)}
                title={optionalButtonLabel}
                aria-label={optionalButtonLabel}
                onClick={() => onClickOptionButton?.(item.id)}
              >
                {optionalButton}
              </button>
            )}
            {onReplace && !buttonSize.isCompact && (
              <button
                type="button"
                className={cn(buttonClassName, insetBottom, insetRight)}
                title={t("この画像を差し替える", "Replace this image")}
                aria-label={t("この画像を差し替える", "Replace this image")}
                onClick={() => onReplace(item.id)}
              >
                <RefreshCwIcon className={buttonSize.icon} />
              </button>
            )}
          </>
        )}
      </div>
      {footer}
      {item.fileName && size >= 76 && (
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
