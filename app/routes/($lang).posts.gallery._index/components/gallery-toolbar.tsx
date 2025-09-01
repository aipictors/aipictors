import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"
import { Grid, List, Settings } from "lucide-react"
import { useTranslation } from "~/hooks/use-translation"

/**
 * ギャラリー用ツールバー
 */
export function GalleryToolbar() {
  const t = useTranslation()

  return (
    <div className="flex items-center gap-2">
      {/* 表示切り替え */}
      <div className="flex items-center rounded-md border">
        <Button
          variant="ghost"
          size="sm"
          className="rounded-r-none border-r"
          title={t("グリッド表示", "Grid view")}
        >
          <Grid className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="rounded-l-none"
          disabled
          title={t("リスト表示", "List view")}
        >
          <List className="size-4" />
        </Button>
      </div>

      {/* 設定 */}
      <Button
        variant="ghost"
        size="sm"
        title={t("表示設定", "Display settings")}
      >
        <Settings className="size-4" />
      </Button>
    </div>
  )
}
