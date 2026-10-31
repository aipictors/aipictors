import { LayoutList, Maximize2, MousePointerClick, Rows3 } from "lucide-react"
import { cn } from "~/lib/utils"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  /** ページ切り替え表示か（undefined なら切り替えを出さない） */
  isPagination?: boolean
  onPaginationChange?: (isPagination: boolean) => void
  isDialogMode: boolean
  onDialogModeChange: (isDialogMode: boolean) => void
  className?: string
}

/**
 * 一覧の表示の切り替え（続けて表示／ページごと、作品をダイアログで開く／ページで開く）
 * 以前は絞り込み欄の中やタブごとにばらばらに置いていて、見つけにくかった
 */
export function HomeViewModeToggles (props: Props) {
  const t = useTranslation()

  const itemClass = (isActive: boolean) =>
    cn(
      "flex h-7 items-center gap-1 rounded-full px-2 font-medium text-xs transition-colors sm:gap-1.5 sm:px-2.5",
      isActive
        ? "bg-background text-foreground shadow-sm"
        : "text-muted-foreground hover:text-foreground",
    )

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5 sm:gap-2", props.className)}>
      {props.isPagination !== undefined && props.onPaginationChange && (
        <fieldset className="inline-flex rounded-full border bg-muted/40 p-0.5">
          <legend className="sr-only">{t("一覧の表示", "List display")}</legend>
          <button
            type="button"
            aria-pressed={!props.isPagination}
            title={t("下にスクロールして続けて表示", "Infinite scroll")}
            onClick={() => props.onPaginationChange?.(false)}
            className={itemClass(!props.isPagination)}
          >
            <Rows3 className="size-3.5" />
            <span className="hidden sm:inline">{t("続けて表示", "Scroll")}</span>
          </button>
          <button
            type="button"
            aria-pressed={props.isPagination}
            title={t("ページごとに表示", "Pages")}
            onClick={() => props.onPaginationChange?.(true)}
            className={itemClass(props.isPagination)}
          >
            <LayoutList className="size-3.5" />
            <span className="hidden sm:inline">{t("ページ", "Pages")}</span>
          </button>
        </fieldset>
      )}
      <fieldset className="inline-flex rounded-full border bg-muted/40 p-0.5">
        <legend className="sr-only">
          {t("作品の開き方", "How to open works")}
        </legend>
        <button
          type="button"
          aria-pressed={props.isDialogMode}
          title={t(
            "一覧のまま作品を開き、前後の作品へすぐ移れます",
            "Open works on top of the list",
          )}
          onClick={() => props.onDialogModeChange(true)}
          className={itemClass(props.isDialogMode)}
        >
          <Maximize2 className="size-3.5" />
          {t("ダイアログ", "Dialog")}
        </button>
        <button
          type="button"
          aria-pressed={!props.isDialogMode}
          title={t("作品ページに移動して開きます", "Open the work page")}
          onClick={() => props.onDialogModeChange(false)}
          className={itemClass(!props.isDialogMode)}
        >
          <MousePointerClick className="size-3.5" />
          {t("ページ", "Page")}
        </button>
      </fieldset>
    </div>
  )
}
