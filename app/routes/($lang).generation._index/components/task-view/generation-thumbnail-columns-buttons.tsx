import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import {
  columnsToThumbnailSize,
  MAX_THUMBNAIL_COLUMNS,
  MIN_THUMBNAIL_COLUMNS,
  QUICK_THUMBNAIL_COLUMNS,
  stepThumbnailSize,
  thumbnailSizeToColumns,
} from "~/routes/($lang).generation._index/utils/thumbnail-columns"

type Props = {
  thumbnailSize: number
  setThumbnailSize: (value: number) => void
}

/**
 * 生成履歴の表示列数の切り替え（◀ 1 2 3 4 ▶）
 * 1〜4 列はボタンで直接選び、5 列以上は ▶ で 1 列ずつ増やす
 */
export function GenerationThumbnailColumnsButtons(props: Props) {
  const t = useTranslation()

  const columns = thumbnailSizeToColumns(props.thumbnailSize)

  const isQuick = (QUICK_THUMBNAIL_COLUMNS as readonly number[]).includes(
    columns,
  )

  return (
    <div
      className="flex shrink-0 items-center"
      title={t("表示列数", "Columns")}
    >
      <Button
        variant="ghost"
        size="icon"
        className="size-7"
        title={t("列を減らす", "Fewer columns")}
        aria-label={t("列を減らす", "Fewer columns")}
        disabled={columns <= MIN_THUMBNAIL_COLUMNS}
        onClick={() =>
          props.setThumbnailSize(stepThumbnailSize(props.thumbnailSize, -1))
        }
      >
        <ChevronLeftIcon className="size-4" />
      </Button>
      {QUICK_THUMBNAIL_COLUMNS.map((value) => (
        <Button
          key={value}
          variant={value === columns ? "secondary" : "ghost"}
          size="icon"
          className={cn(
            "hidden size-7 text-xs sm:inline-flex",
            value === columns && "font-bold",
          )}
          title={t(`${value} 列で表示`, `${value} columns`)}
          aria-pressed={value === columns}
          onClick={() => props.setThumbnailSize(columnsToThumbnailSize(value))}
        >
          {value}
        </Button>
      ))}
      {/* 5 列以上のとき・スマホでは今の列数を出す */}
      <span
        className={cn(
          "min-w-7 text-center font-bold text-xs",
          isQuick && "sm:hidden",
        )}
        aria-live="polite"
      >
        {columns}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="size-7"
        title={t("列を増やす", "More columns")}
        aria-label={t("列を増やす", "More columns")}
        disabled={columns >= MAX_THUMBNAIL_COLUMNS}
        onClick={() =>
          props.setThumbnailSize(stepThumbnailSize(props.thumbnailSize, 1))
        }
      >
        <ChevronRightIcon className="size-4" />
      </Button>
    </div>
  )
}
