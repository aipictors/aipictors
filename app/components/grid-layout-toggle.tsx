import { LayoutGrid, LayoutPanelTop } from "lucide-react"
import { useGridLayout } from "~/hooks/use-grid-layout"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"

type Props = {
  className?: string
}

/**
 * 作品一覧のサムネイルの並べ方の切り替え（正方形／元の比率）。
 * 設定はサイト全体の一覧に効く
 */
export function GridLayoutToggle(props: Props) {
  const t = useTranslation()

  const { gridLayout, setGridLayout } = useGridLayout()

  const itemClass = (isActive: boolean) =>
    cn(
      "flex h-7 items-center gap-1 rounded-full px-2 font-medium text-xs transition-colors sm:gap-1.5 sm:px-2.5",
      isActive
        ? "bg-background text-foreground shadow-sm"
        : "text-muted-foreground hover:text-foreground",
    )

  return (
    <fieldset
      className={cn(
        "inline-flex rounded-full border bg-muted/40 p-0.5",
        props.className,
      )}
    >
      <legend className="sr-only">
        {t("サムネイルの並べ方", "Thumbnail layout")}
      </legend>
      <button
        type="button"
        aria-pressed={gridLayout === "square"}
        title={t("正方形で並べる", "Square grid")}
        onClick={() => setGridLayout("square")}
        className={itemClass(gridLayout === "square")}
      >
        <LayoutGrid className="size-3.5" />
        <span className="hidden sm:inline">{t("正方形", "Square")}</span>
      </button>
      <button
        type="button"
        aria-pressed={gridLayout === "justified"}
        title={t("元の縦横比のまま並べる", "Original aspect ratio")}
        onClick={() => setGridLayout("justified")}
        className={itemClass(gridLayout === "justified")}
      >
        <LayoutPanelTop className="size-3.5" />
        <span className="hidden sm:inline">{t("元の比率", "Original")}</span>
      </button>
    </fieldset>
  )
}
