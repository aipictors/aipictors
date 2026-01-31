import { useSearchParams } from "@remix-run/react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Switch } from "~/components/ui/switch"
import { Label } from "~/components/ui/label"
import { useTranslation } from "~/hooks/use-translation"
import { Filter, X } from "lucide-react"
import { useState } from "react"

type Props = {
  initialRating: "G" | "R15" | "R18" | "R18G"
  initialWorkType: "WORK" | "NOVEL" | "VIDEO" | "COLUMN" | null
  initialSort: "DATE_CREATED" | "LIKES_COUNT" | "VIEWS_COUNT" | "COMMENTS_COUNT"
  initialStyle: "ILLUSTRATION" | "PHOTO" | "SEMI_REAL" | null
  initialIsSensitive: boolean
}

/**
 * ギャラリー用フィルターコンポーネント
 */
export function GalleryFilters (props: Props) {
  const t = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [isExpanded, setIsExpanded] = useState(false)

  const updateParam = (key: string, value: string | null) => {
    const newParams = new URLSearchParams(searchParams)
    if (value) {
      newParams.set(key, value)
    } else {
      newParams.delete(key)
    }
    setSearchParams(newParams)
  }

  const clearFilters = () => {
    setSearchParams({})
  }

  const hasActiveFilters =
    props.initialWorkType ||
    props.initialStyle ||
    props.initialSort !== "DATE_CREATED" ||
    props.initialIsSensitive

  return (
    <div className="space-y-4">
      {/* フィルターボタン */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="gap-2"
        >
          <Filter className="size-4" />
          {t("フィルター", "Filters")}
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-1">
              {
                [
                  props.initialWorkType,
                  props.initialStyle,
                  props.initialSort !== "DATE_CREATED" ? "sorted" : null,
                  props.initialIsSensitive ? "sensitive" : null,
                ].filter(Boolean).length
              }
            </Badge>
          )}
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="gap-2"
          >
            <X className="size-4" />
            {t("クリア", "Clear")}
          </Button>
        )}
      </div>

      {/* フィルター内容 */}
      {isExpanded && (
        <div className="grid grid-cols-1 gap-4 rounded-lg border bg-card/50 p-4 md:grid-cols-2 lg:grid-cols-5">
          {/* 作品タイプ */}
          <div className="space-y-2">
            <Label className="font-medium text-sm">
              {t("作品タイプ", "Work Type")}
            </Label>
            <Select
              value={props.initialWorkType || ""}
              onValueChange={(value) => updateParam("workType", value || null)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("すべて", "All")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t("すべて", "All")}</SelectItem>
                <SelectItem value="WORK">
                  {t("イラスト", "Illustration")}
                </SelectItem>
                <SelectItem value="VIDEO">{t("動画", "Video")}</SelectItem>
                <SelectItem value="NOVEL">{t("小説", "Novel")}</SelectItem>
                <SelectItem value="COLUMN">{t("コラム", "Column")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* スタイル */}
          <div className="space-y-2">
            <Label className="font-medium text-sm">
              {t("スタイル", "Style")}
            </Label>
            <Select
              value={props.initialStyle || ""}
              onValueChange={(value) => updateParam("style", value || null)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("すべて", "All")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t("すべて", "All")}</SelectItem>
                <SelectItem value="ILLUSTRATION">
                  {t("イラスト", "Illustration")}
                </SelectItem>
                <SelectItem value="PHOTO">{t("写真", "Photo")}</SelectItem>
                <SelectItem value="SEMI_REAL">
                  {t("セミリアル", "Semi-Real")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* ソート */}
          <div className="space-y-2">
            <Label className="font-medium text-sm">
              {t("並び順", "Sort by")}
            </Label>
            <Select
              value={props.initialSort}
              onValueChange={(value) => updateParam("sort", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DATE_CREATED">
                  {t("新着順", "Latest")}
                </SelectItem>
                <SelectItem value="LIKES_COUNT">
                  {t("いいね数", "Most Liked")}
                </SelectItem>
                <SelectItem value="VIEWS_COUNT">
                  {t("閲覧数", "Most Viewed")}
                </SelectItem>
                <SelectItem value="COMMENTS_COUNT">
                  {t("コメント数", "Most Commented")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 年齢制限 */}
          <div className="space-y-2">
            <Label className="font-medium text-sm">
              {t("年齢制限", "Age Rating")}
            </Label>
            <Select
              value={props.initialRating}
              onValueChange={(value) => updateParam("rating", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="G">{t("全年齢", "General")}</SelectItem>
                <SelectItem value="R15">{t("R-15", "R-15")}</SelectItem>
                <SelectItem value="R18">{t("R-18", "R-18")}</SelectItem>
                <SelectItem value="R18G">{t("R-18G", "R-18G")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* センシティブコンテンツ */}
          <div className="space-y-2">
            <Label className="font-medium text-sm">
              {t("センシティブ", "Sensitive")}
            </Label>
            <div className="flex items-center space-x-2">
              <Switch
                checked={props.initialIsSensitive}
                onCheckedChange={(checked) =>
                  updateParam("sensitive", checked ? "true" : null)
                }
              />
              <Label className="text-sm">
                {t("センシティブコンテンツを表示", "Show sensitive content")}
              </Label>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
