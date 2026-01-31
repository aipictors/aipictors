import { Crown, TrendingUp, Eye } from "lucide-react"
import { Card, CardContent } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"
import { Link, useLocation } from "@remix-run/react"
import { useState } from "react"
import type { RecommendedTag } from "~/routes/($lang)._main.tags._index/types/tag"

type Props = {
  tags: RecommendedTag[]
}

export function PopularTagsSection ({ tags }: Props) {
  const t = useTranslation()
  const location = useLocation()
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // 現在のページが/r/tagsかどうかを判定
  const isR18Mode = location.pathname.includes("/r/tags")

  // 人気タグ（先頭20個を使用）
  const popularTags = tags.slice(0, 20)

  // ランキング表示用の装飾
  const getRankDecoration = (index: number) => {
    switch (index) {
      case 0:
        return {
          icon: Crown,
          color: "text-yellow-500",
          bg: "bg-yellow-100 dark:bg-yellow-900/30",
        }
      case 1:
        return {
          icon: Crown,
          color: "text-gray-400 dark:text-gray-300",
          bg: "bg-gray-100 dark:bg-gray-700/30",
        }
      case 2:
        return {
          icon: Crown,
          color: "text-orange-500",
          bg: "bg-orange-100 dark:bg-orange-900/30",
        }
      default:
        return {
          icon: TrendingUp,
          color: "text-blue-500",
          bg: "bg-blue-100 dark:bg-blue-900/30",
        }
    }
  }

  return (
    <section className="space-y-6">
      {/* セクションヘッダー */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Crown className="h-8 w-8 text-yellow-500" />
            <h2 className="bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text font-bold text-4xl text-transparent dark:from-yellow-400 dark:to-orange-400">
              {t("人気タグ", "Popular Tags")}
            </h2>
          </div>
          <p className="text-muted-foreground">
            {t(
              "おすすめタグから人気のものをピックアップ",
              "Popular picks from recommended tags",
            )}
          </p>
        </div>

        {/* 表示切り替えボタン */}
        <div className="flex gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className="flex items-center gap-2"
          >
            <div className="grid h-3 w-3 grid-cols-2 gap-0.5">
              <div className="rounded-xs bg-current" />
              <div className="rounded-xs bg-current" />
              <div className="rounded-xs bg-current" />
              <div className="rounded-xs bg-current" />
            </div>
            {t("グリッド", "Grid")}
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="flex items-center gap-2"
          >
            <div className="flex h-3 w-3 flex-col gap-0.5">
              <div className="h-0.5 rounded-xs bg-current" />
              <div className="h-0.5 rounded-xs bg-current" />
              <div className="h-0.5 rounded-xs bg-current" />
            </div>
            {t("リスト", "List")}
          </Button>
        </div>
      </div>

      {/* タグ表示エリア */}
      <div className="rounded-3xl bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 p-6 dark:from-yellow-950/20 dark:via-orange-950/20 dark:to-red-950/20">
        {viewMode === "grid" ? (
          // グリッド表示
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {popularTags.map((tag, index) => {
              const decoration = getRankDecoration(index)
              const IconComponent = decoration.icon

              return (
                <div
                  key={`${tag.tagName}-${index}`}
                  className="animate-fade-in-up transition-all duration-300 hover:shadow-lg"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <Link to={`${isR18Mode ? "/r" : ""}/tags/${tag.tagName}`}>
                    <Card className="relative cursor-pointer border-2 bg-white/90 backdrop-blur-sm transition-all duration-300 hover:border-yellow-300 hover:shadow-lg dark:border-gray-600 dark:bg-gray-800/95 dark:hover:border-yellow-500">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          {/* ランキング */}
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full ${decoration.bg}`}
                          >
                            <span className="font-bold text-gray-900 text-sm dark:text-white">
                              {index + 1}
                            </span>
                          </div>

                          {/* タグ情報 */}
                          <div className="min-w-0 flex-1">
                            <h3 className="truncate font-bold text-gray-800 dark:text-gray-200">
                              {tag.tagName}
                            </h3>
                            <div className="flex items-center gap-2 text-muted-foreground text-sm">
                              <Eye className="h-3 w-3" />
                              <span>{t("おすすめ", "Recommended")}</span>
                            </div>
                          </div>

                          {/* ランキングアイコン */}
                          <IconComponent
                            className={`h-5 w-5 ${decoration.color}`}
                          />
                        </div>

                        {/* バッジ */}
                        <div className="mt-3 flex gap-1">
                          {index < 3 && (
                            <Badge variant="secondary" className="text-xs">
                              {t("TOP3", "TOP3")}
                            </Badge>
                          )}
                          <Badge variant="secondary" className="text-xs">
                            {t("おすすめ", "Recommended")}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              )
            })}
          </div>
        ) : (
          // リスト表示
          <div className="space-y-2">
            {popularTags.map((tag, index) => {
              const decoration = getRankDecoration(index)
              const IconComponent = decoration.icon

              return (
                <div
                  key={`${tag.tagName}-${index}`}
                  className="animate-fade-in-up transition-all duration-200"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <Link to={`${isR18Mode ? "/r" : ""}/tags/${tag.tagName}`}>
                    <Card className="cursor-pointer border bg-white/90 backdrop-blur-sm transition-all duration-200 hover:border-yellow-300 hover:shadow-md dark:border-gray-600 dark:bg-gray-800/95 dark:hover:border-yellow-500">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            {/* ランキング番号 */}
                            <div
                              className={`flex h-10 w-10 items-center justify-center rounded-full font-bold ${decoration.bg}`}
                            >
                              <span className="text-gray-900 dark:text-white">
                                {index + 1}
                              </span>
                            </div>

                            {/* タグ名 */}
                            <h3 className="font-bold text-gray-800 text-lg dark:text-gray-200">
                              {tag.tagName}
                            </h3>

                            {/* バッジ */}
                            <div className="flex gap-2">
                              {index < 3 && (
                                <Badge variant="secondary">
                                  {t("TOP3", "TOP3")}
                                </Badge>
                              )}
                              <Badge variant="secondary">
                                {t("おすすめ", "Recommended")}
                              </Badge>
                            </div>
                          </div>

                          {/* 統計情報 */}
                          <div className="flex items-center gap-6 text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Eye className="h-4 w-4" />
                              <span className="font-medium">
                                {t("推奨", "Featured")}
                              </span>
                            </div>
                            <IconComponent
                              className={`h-5 w-5 ${decoration.color}`}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
