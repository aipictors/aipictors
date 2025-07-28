import { TrendingUp, Eye } from "lucide-react"
import { Card, CardContent } from "~/components/ui/card"
import { Link } from "@remix-run/react"
import type { RecommendedTag } from "~/routes/($lang)._main.tags._index/types/tag"

type Props = {
  tags: RecommendedTag[]
}

export function TrendingTagsSection({ tags }: Props) {
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
        <h2 className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text font-bold text-4xl text-transparent">
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
              <Link to={`/tags/${tag.tagName}`}>
                <Card className="group relative cursor-pointer border-2 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:border-orange-300 hover:shadow-xl">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-lg">{tag.tagName}</h3>
                        <div className="rounded-full bg-orange-100 px-2 py-1 font-medium text-orange-600 text-xs">
                          #{index + 1}
                        </div>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
                        <Eye className="h-4 w-4" />
                        <span>人気タグ</span>
                        <div className="flex items-center text-orange-500">
                          <TrendingUp className="mr-1 h-3 w-3" />
                          おすすめ
                        </div>
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
