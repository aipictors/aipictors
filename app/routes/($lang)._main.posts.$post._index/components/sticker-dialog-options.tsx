import { LayoutGridIcon, PinIcon, RectangleEllipsisIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "~/components/ui/button"
import { MAX_PINNED_STICKERS } from "~/hooks/use-pinned-stickers"
import { useTranslation } from "~/hooks/use-translation"

const VIEW_MODE_STORAGE_KEY = "aipictors:sticker-view-mode"

export type StickerViewMode = "PAGED" | "BULK"

/**
 * スタンプの表示方法（ページ送り・一括）。前回選んだほうを覚えておく
 */
export function useStickerViewMode() {
  const [viewMode, setViewMode] = useState<StickerViewMode>("PAGED")

  useEffect(() => {
    try {
      if (window.localStorage.getItem(VIEW_MODE_STORAGE_KEY) === "BULK") {
        setViewMode("BULK")
      }
    } catch {
      // localStorage が使えなくてもページ送りで表示できる
    }
  }, [])

  const toggleViewMode = () => {
    const next = viewMode === "BULK" ? "PAGED" : "BULK"
    setViewMode(next)
    try {
      window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, next)
    } catch {
      // 保存できなくても今の表示は切り替わる
    }
  }

  return { viewMode, toggleViewMode }
}

type Props = {
  viewMode: StickerViewMode
  onToggleViewMode: () => void
  isPinEditing: boolean
  onTogglePinEditing: () => void
  pinnedCount: number
}

/**
 * スタンプ一覧の「一括表示」「固定の編集」ボタン
 */
export function StickerDialogOptions(props: Props) {
  const t = useTranslation()

  return (
    <>
      <Button
        size="sm"
        variant="secondary"
        onClick={props.onToggleViewMode}
        className="gap-1"
      >
        {props.viewMode === "BULK" ? (
          <RectangleEllipsisIcon className="size-4" />
        ) : (
          <LayoutGridIcon className="size-4" />
        )}
        {props.viewMode === "BULK"
          ? t("ページ表示", "Paged")
          : t("一括表示", "Show all")}
      </Button>
      <Button
        size="sm"
        variant={props.isPinEditing ? "default" : "secondary"}
        onClick={props.onTogglePinEditing}
        className="gap-1"
        aria-pressed={props.isPinEditing}
      >
        <PinIcon className="size-4" />
        {t("固定", "Pin")} {props.pinnedCount}/{MAX_PINNED_STICKERS}
      </Button>
      {props.isPinEditing && (
        <p className="w-full text-muted-foreground text-xs">
          {t(
            "スタンプを押すと、コメント欄に固定／解除できます（編集中は送信されません）",
            "Tap a sticker to pin or unpin it in the comment box. Stickers are not sent while editing.",
          )}
        </p>
      )}
    </>
  )
}
