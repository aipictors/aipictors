import { TrendingUp } from "lucide-react"
import { Card, CardContent } from "~/components/ui/card"
import { Link, useLocation } from "@remix-run/react"
import type { RecommendedTag } from "~/routes/($lang)._main.tags._index/types/tag"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  tags: RecommendedTag[]
}

export function TrendingTagsSection ({ tags }: Props) {
  const t = useTranslation()
  const location = useLocation()
  // 現在のページが/r/tagsかどうかを判定
  const isR18Mode = location.pathname.includes("/r/tags")

  const sparkles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 2,
  }))

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <div className="flex items-center justify-center">
          <TrendingUp className="h-8 w-8 animate-bounce text-orange-500" />
        </div>
        <h2 className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text font-bold text-4xl text-transparent dark:from-orange-400 dark:to-red-400">
          トレンドタグ
        </h2>
        <p className="text-muted-foreground">今注目を集めているタグをお届け</p>
      </div>

      <div className="relative min-h-[400px] overflow-hidden rounded-3xl bg-gradient-to-br from-orange-50 to-red-50 p-8 dark:from-orange-950/20 dark:to-red-950/20">
        {/* 背景のきらめき効果 */}
        {sparkles.map((sparkle) => (
          <div
            key={sparkle.id}
            style={{
              left: `${sparkle.x}%`,
              top: `${sparkle.y}%`,
              animationDelay: `${sparkle.delay}s`,
            }}
            className="absolute h-2 w-2 animate-pulse rounded-full bg-gradient-to-r from-orange-400 to-red-400"
          />
        ))}

        <div className="relative flex flex-wrap items-center justify-center gap-4">
          {tags.slice(0, 12).map((tag, index) => (
            <div
              key={`${tag.tagName}-${index}`}
              className="animate-fade-in transition-all duration-500"
            >
              <Link to={`${isR18Mode ? "/r" : ""}/tags/${tag.tagName}`}>
                <Card className="group relative cursor-pointer border-2 bg-white/90 backdrop-blur-sm transition-all duration-300 hover:border-orange-300 hover:shadow-xl dark:border-gray-600 dark:bg-gray-800/95 dark:hover:border-orange-500">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-lg dark:text-white">
                          {tag.tagName}
                        </h3>
                        <div className="rounded-full bg-gradient-to-r from-orange-100 to-red-100 px-3 py-1 font-medium text-orange-600 text-xs dark:from-orange-900/50 dark:to-red-900/50 dark:text-orange-300">
                          {t("人気", "Popular")} {index + 1}
                        </div>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
                        <TrendingUp className="h-4 w-4 text-orange-500" />
                        <span>{t("トレンド", "Trending")}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
