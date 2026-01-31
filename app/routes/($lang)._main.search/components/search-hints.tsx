import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Tag, Search, Cpu, TrendingUp } from "lucide-react"
import { useNavigate } from "@remix-run/react"
import { useTranslation } from "~/hooks/use-translation"
import { graphql } from "gql.tada"

type PopularTag = {
  id: string
  name: string
  count: number
  thumbnailUrl?: string
}

type AiModel = {
  id: string
  name: string
  displayName: string
  workModelId: string
  thumbnailImageURL?: string | undefined
}

type Props = {
  popularTags: PopularTag[]
  popularKeywords: string[]
  popularModels: AiModel[]
}

function TagGrid(props: {
  tags: PopularTag[]
  onTagClick: (name: string) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {props.tags.map((tag) => (
        // biome-ignore lint/a11y/useKeyWithClickEvents: thumb grid uses click handler
        <div
          key={tag.id}
          className="group relative cursor-pointer overflow-hidden rounded-md"
          onClick={() => props.onTagClick(tag.name)}
        >
          {tag.thumbnailUrl ? (
            <img
              className="h-[120px] w-full bg-white object-cover object-center transition-transform duration-200 ease-in-out group-hover:scale-105"
              src={tag.thumbnailUrl}
              alt={tag.name}
            />
          ) : (
            <div className="h-[120px] w-full bg-gradient-to-br from-purple-400 to-pink-400" />
          )}
          <div className="absolute right-0 bottom-0 left-0 box-border flex h-12 flex-col justify-end bg-gradient-to-t from-black to-transparent p-2 opacity-88">
            <p className="truncate font-medium text-white text-xs">{`#${tag.name}`}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export function SearchHints (props: Props) {
  const navigate = useNavigate()
  const t = useTranslation()

  const handleTagClick = (tagName: string) => {
    navigate(`/search?q=${encodeURIComponent(tagName)}`)
  }

  const handleKeywordClick = (keyword: string) => {
    navigate(`/search?q=${encodeURIComponent(keyword)}`)
  }

  const handleModelClick = (modelId: string) => {
    navigate(`/search?model=${encodeURIComponent(modelId)}`)
  }

  const getModelBlurb = (modelName: string) => {
    const name = modelName.toLowerCase()

    if (name.includes("flux")) {
      return t("写実寄り・高精細", "Photorealistic, high-detail")
    }
    if (name.includes("animagine")) {
      return t("高密度なアニメ調", "Dense anime style")
    }
    if (name.includes("anything")) {
      return t("王道アニメ調", "Classic anime style")
    }
    if (name.includes("sdxl") || name.includes("stable diffusion")) {
      return t("汎用・バランス型", "General-purpose, balanced")
    }
    if (name.includes("pony")) {
      return t("二次元寄り・表情豊か", "2D leaning, expressive")
    }

    return t("画風の違いで探す", "Browse by style")
  }

  const classifyTag = (tagName: string) => {
    const normalized = tagName.replace(/^#/, "").trim().toLowerCase()

    // トレンドっぽい（年号/イベントっぽい）
    if (/20\d\d|\d{4}/.test(normalized) || normalized.includes("トレンド")) {
      return "trend" as const
    }

    // 定番っぽい雰囲気
    const classic = new Set([
      "かわいい",
      "美少女",
      "イケメン",
      "かっこいい",
      "エモい",
      "ふわふわ",
      "クール",
      "制服",
      "ロリ",
      "メイド",
    ])
    if (classic.has(tagName) || classic.has(normalized)) {
      return "classic" as const
    }

    // それ以外はジャンル扱い
    return "genre" as const
  }

  const groupedTags = (() => {
    const groups: Record<"genre" | "trend" | "classic", PopularTag[]> = {
      genre: [],
      trend: [],
      classic: [],
    }

    for (const tag of props.popularTags) {
      const group = classifyTag(tag.name)
      groups[group].push(tag)
    }

    // どこかが空なら、人気順のスライスで埋める（データが分類できない場合の保険）
    const fallback = props.popularTags
    if (groups.genre.length === 0 && fallback.length > 0) {
      groups.genre = fallback.slice(0, 5)
    }
    if (groups.trend.length === 0 && fallback.length > 5) {
      groups.trend = fallback.slice(5, 10)
    }
    if (groups.classic.length === 0 && fallback.length > 10) {
      groups.classic = fallback.slice(10, 15)
    }

    return {
      genre: groups.genre.slice(0, 10),
      trend: groups.trend.slice(0, 10),
      classic: groups.classic.slice(0, 10),
    }
  })()

  return (
    <div className="space-y-6">
      {/* タグ（意味をつけて探索しやすく） */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Tag className="size-5" />
            {t("似た雰囲気を探す", "Find Similar Vibes")}
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            {t(
              "雰囲気・題材・定番などから、次の一枚を見つけやすくします",
              "Find the next piece by vibe, theme, and evergreen picks",
            )}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <h3 className="font-semibold text-sm">
                {t("人気ジャンル", "Popular Genres")}
              </h3>
              <p className="text-muted-foreground text-xs">
                {t("題材・世界観で探す", "Find by theme")}
              </p>
            </div>
            <TagGrid tags={groupedTags.genre} onTagClick={handleTagClick} />
          </div>

          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <h3 className="font-semibold text-sm">
                {t("最近流行っている", "Trending Now")}
              </h3>
              <p className="text-muted-foreground text-xs">
                {t("最近よく見られるタグ", "Currently popular")}
              </p>
            </div>
            <TagGrid tags={groupedTags.trend} onTagClick={handleTagClick} />
          </div>

          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <h3 className="font-semibold text-sm">
                {t("定番テーマ", "Evergreen")}
              </h3>
              <p className="text-muted-foreground text-xs">
                {t("雰囲気・好みで探す", "Find by vibe")}
              </p>
            </div>
            <TagGrid tags={groupedTags.classic} onTagClick={handleTagClick} />
          </div>
        </CardContent>
      </Card>

      {/* よく検索されているキーワード */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="size-5" />
            {t("いま人気のキーワード", "Trending Keywords")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {props.popularKeywords.map((keyword) => (
              <Button
                key={keyword}
                variant="ghost"
                size="sm"
                className="h-auto rounded-full border px-3 py-1"
                onClick={() => handleKeywordClick(keyword)}
              >
                <Search className="mr-1 size-3" />
                <span className="text-sm">{keyword}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 人気モデル */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Cpu className="size-5" />
            {t("モデル一覧", "Models")}
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            {t(
              "押すと、そのモデルで投稿された作品一覧を表示します",
              "Tap to show works posted with that model",
            )}
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {props.popularModels.map((model) => (
              <Button
                key={model.id}
                variant="outline"
                className="flex h-auto items-start gap-3 p-3 text-left"
                onClick={() => handleModelClick(model.workModelId)}
              >
                {model.thumbnailImageURL && (
                  <img
                    src={model.thumbnailImageURL}
                    alt={model.name}
                    className="size-12 rounded object-cover"
                  />
                )}
                <div className="min-w-0">
                  <p className="truncate font-medium text-xs">
                    {model.displayName}
                  </p>
                  <p className="mt-1 line-clamp-2 text-muted-foreground text-xs leading-snug">
                    {getModelBlurb(model.displayName)}
                  </p>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// GraphQLフラグメント（将来的にデータ取得で使用）
export const PopularTagFragment = graphql(`
  fragment PopularTag on RecommendedTagNode @_unmask {
    tagName
    thumbnailUrl
  }
`)
