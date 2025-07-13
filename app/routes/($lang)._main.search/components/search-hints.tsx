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

export function SearchHints(props: Props) {
  const navigate = useNavigate()
  const t = useTranslation()

  const handleTagClick = (tagName: string) => {
    navigate(`/search?q=${encodeURIComponent(tagName)}`)
  }

  const handleKeywordClick = (keyword: string) => {
    navigate(`/search?q=${encodeURIComponent(keyword)}`)
  }

  const handleModelClick = (modelId: string) => {
    navigate(`/search?workModelId=${encodeURIComponent(modelId)}`)
  }

  return (
    <div className="space-y-6">
      {/* 人気タグ */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Tag className="size-5" />
            {t("人気タグ", "Popular Tags")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {props.popularTags.map((tag) => (
              // biome-ignore lint/a11y/noStaticElementInteractions: <explanation>
              // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
              <div
                key={tag.id}
                className="group relative cursor-pointer overflow-hidden rounded-md"
                onClick={() => handleTagClick(tag.name)}
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
        </CardContent>
      </Card>

      {/* よく検索されているキーワード */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="size-5" />
            {t("トレンドキーワード", "Trending Keywords")}
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
            {t("人気のAIモデル", "Popular AI Models")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {props.popularModels.map((model) => (
              <Button
                key={model.id}
                variant="outline"
                className="flex h-auto flex-col p-3"
                onClick={() => handleModelClick(model.workModelId)}
              >
                {model.thumbnailImageURL && (
                  <img
                    src={model.thumbnailImageURL}
                    alt={model.name}
                    className="mb-2 size-12 rounded object-cover"
                  />
                )}
                <span className="text-center font-medium text-xs">
                  {model.displayName}
                </span>
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
