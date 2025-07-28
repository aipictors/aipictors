import {
  Palette,
  Camera,
  Book,
  Music,
  Gamepad2,
  Heart,
  Star,
  Zap,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "@remix-run/react"
import type { RecommendedTag } from "~/routes/($lang)._main.tags._index/types/tag"

type Props = {
  tags: RecommendedTag[]
}

// カテゴリ定義
const categories = [
  {
    name: "アート",
    nameEn: "Art",
    icon: Palette,
    color: "from-pink-500 to-rose-500",
    bgColor:
      "from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20",
    keywords: [
      "イラスト",
      "絵",
      "アート",
      "painting",
      "art",
      "illustration",
      "drawing",
    ],
  },
  {
    name: "写真",
    nameEn: "Photography",
    icon: Camera,
    color: "from-blue-500 to-cyan-500",
    bgColor:
      "from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20",
    keywords: ["写真", "photo", "photography", "camera", "portrait"],
  },
  {
    name: "文芸",
    nameEn: "Literature",
    icon: Book,
    color: "from-green-500 to-emerald-500",
    bgColor:
      "from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20",
    keywords: ["小説", "poetry", "novel", "story", "literature", "writing"],
  },
  {
    name: "音楽",
    nameEn: "Music",
    icon: Music,
    color: "from-purple-500 to-violet-500",
    bgColor:
      "from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20",
    keywords: ["音楽", "music", "song", "sound", "audio", "musical"],
  },
  {
    name: "ゲーム",
    nameEn: "Gaming",
    icon: Gamepad2,
    color: "from-orange-500 to-red-500",
    bgColor:
      "from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20",
    keywords: ["ゲーム", "game", "gaming", "character", "anime", "manga"],
  },
  {
    name: "キャラクター",
    nameEn: "Characters",
    icon: Heart,
    color: "from-yellow-500 to-amber-500",
    bgColor:
      "from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20",
    keywords: [
      "キャラクター",
      "character",
      "オリジナル",
      "original",
      "mascot",
      "ちび",
    ],
  },
]

export function TagCategoriesSection({ tags }: Props) {
  const t = useTranslation()

  // カテゴリごとにタグを分類
  const categorizedTags = categories
    .map((category) => {
      const categoryTags = tags
        .filter((tag) => {
          const tagName = tag.tagName.toLowerCase()
          return category.keywords.some((keyword) =>
            tagName.includes(keyword.toLowerCase()),
          )
        })
        .slice(0, 8) // 各カテゴリ最大8個

      return {
        ...category,
        tags: categoryTags,
        totalTags: categoryTags.length,
      }
    })
    .filter((category) => category.tags.length > 0)

  return (
    <section className="space-y-8">
      {/* セクションヘッダー */}
      <div className="space-y-2 text-center">
        <div className="flex items-center justify-center gap-3">
          <Star className="h-8 w-8 text-yellow-500" />
          <h2 className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text font-bold text-4xl text-transparent">
            {t("カテゴリ別タグ", "Tags by Category")}
          </h2>
        </div>
        <p className="text-muted-foreground">
          {t(
            "ジャンル別に整理されたタグを探索",
            "Explore tags organized by genre",
          )}
        </p>
      </div>

      {/* カテゴリグリッド */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {categorizedTags.map((category, categoryIndex) => {
          const IconComponent = category.icon
          return (
            <div
              key={category.name}
              className="animate-fade-in-up"
              style={{ animationDelay: `${categoryIndex * 100}ms` }}
            >
              <Card
                className={`relative overflow-hidden border-2 bg-gradient-to-br transition-all duration-300 hover:border-opacity-60 hover:shadow-xl ${category.bgColor}`}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3">
                    <div
                      className={`rounded-lg bg-gradient-to-r p-2 text-white ${category.color}`}
                    >
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">
                        {t(category.name, category.nameEn)}
                      </h3>
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Zap className="h-3 w-3" />
                        <span>
                          {category.totalTags} {t("タグ", "tags")}
                        </span>
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* タグリスト */}
                  <div className="flex flex-wrap gap-2">
                    {category.tags.map((tag, index) => (
                      <Link
                        key={`${tag.tagName}-${index}`}
                        to={`/tags/${tag.tagName}`}
                      >
                        <Badge
                          variant="secondary"
                          className="cursor-pointer bg-white/60 transition-colors hover:bg-white/80"
                        >
                          #{tag.tagName}
                        </Badge>
                      </Link>
                    ))}
                  </div>

                  {/* カテゴリ統計 */}
                  <div className="border-gray-200/50 border-t pt-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {t("タグ数", "Tags")}: {category.tags.length}
                      </span>
                      <div
                        className={`rounded-full bg-gradient-to-r px-2 py-1 font-medium text-white text-xs transition-colors ${category.color}`}
                      >
                        {t("おすすめ", "Recommended")}
                      </div>
                    </div>
                  </div>
                </CardContent>

                {/* 背景装飾 */}
                <div className="absolute top-0 right-0 opacity-10">
                  <IconComponent className="h-24 w-24 rotate-12 transform" />
                </div>
              </Card>
            </div>
          )
        })}
      </div>
    </section>
  )
}
