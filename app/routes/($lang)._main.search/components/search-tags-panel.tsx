import { useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { HashIcon } from "lucide-react"
import { useState } from "react"
import { PictorChanSays } from "~/components/pictor-chan-says"
import { Button } from "~/components/ui/button"
import { Skeleton } from "~/components/ui/skeleton"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { toResizedImageUrl } from "~/utils/resized-image-url"
import {
  isFeaturableSensitiveTag,
  isSuggestableSensitiveTag,
} from "~/utils/sensitive-tag-filter"

const PAGE_SIZE = 40

/**
 * 昔の作品には「ねこ 猫 ぬこ」のように空白でつないだ 1 つのタグや、とても長いタグがあるので一覧から外す
 * （アプリの検索と同じ）
 */
const isListableTagName = (name: string) => {
  const trimmed = name.trim()
  return (
    trimmed !== "" && trimmed.length <= 40 && trimmed.split(/\s+/).length < 3
  )
}

/**
 * 名前に言葉を含むタグ（アプリの検索の「タグ」タブと同じ）
 */
export function SearchTagsPanel(props: {
  query: string
  isSensitiveMode: boolean
  pagePrefix: string
}) {
  const t = useTranslation()
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const { data, loading, error, fetchMore, refetch } = useQuery(
    searchTagsQuery,
    {
      variables: {
        offset: 0,
        limit: PAGE_SIZE,
        where: { search: props.query },
      },
      onCompleted: (result) => setHasMore(result.tags.length >= PAGE_SIZE),
    },
  )

  const loadedCount = data?.tags.length ?? 0
  const tags = (data?.tags ?? []).filter(
    (tag) =>
      isListableTagName(tag.name) &&
      // タグ名だけが並ぶので、未成年・実在の人物などを連想させるタグは出さない
      (props.isSensitiveMode
        ? isFeaturableSensitiveTag(tag.name)
        : isSuggestableSensitiveTag(tag.name)),
  )

  const loadMore = async () => {
    setIsLoadingMore(true)
    try {
      const result = await fetchMore({
        variables: { offset: loadedCount },
        updateQuery: (prev, { fetchMoreResult }) => {
          const known = new Set(prev.tags.map((tag) => tag.id))
          return {
            tags: [
              ...prev.tags,
              ...fetchMoreResult.tags.filter((tag) => !known.has(tag.id)),
            ],
          }
        },
      })
      setHasMore(result.data.tags.length >= PAGE_SIZE)
    } finally {
      setIsLoadingMore(false)
    }
  }

  if (loading && loadedCount === 0) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
        {Array.from({ length: 12 }, (_, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: 読み込み中の枠
          <Skeleton key={index} className="aspect-[3/2] w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (error && loadedCount === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-8 text-center text-sm">
        <p>{t("タグを読み込めませんでした", "Could not load tags")}</p>
        <Button variant="outline" onClick={() => refetch()}>
          {t("もう一度読み込む", "Retry")}
        </Button>
      </div>
    )
  }

  if (tags.length === 0 && !hasMore) {
    return (
      <div className="flex min-h-48 items-center justify-center rounded-2xl border border-dashed p-6">
        <PictorChanSays>
          {t(
            `「${props.query}」を含むタグは見つかりませんでした`,
            `No tags contain "${props.query}"`,
          )}
        </PictorChanSays>
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
        {tags.map((tag) => {
          // 全年齢の検索では、最初の作品が全年齢のときだけ画像を出す
          const thumbnailUrl =
            tag.firstWork &&
            (props.isSensitiveMode || tag.firstWork.rating === "G")
              ? tag.firstWork.smallThumbnailImageURL
              : null
          return (
            <Link
              key={tag.id}
              to={`${props.pagePrefix}/tags/${encodeURIComponent(tag.name)}`}
              className="group relative block aspect-[3/2] overflow-hidden rounded-xl bg-muted"
            >
              {thumbnailUrl ? (
                <img
                  src={toResizedImageUrl(thumbnailUrl, 320)}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <HashIcon className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 size-10 text-muted-foreground/40" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <span className="absolute right-2 bottom-2 left-2 line-clamp-2 break-all font-bold text-sm text-white drop-shadow">
                #{tag.name}
              </span>
            </Link>
          )
        })}
      </div>
      {hasMore && (
        <div className="mt-6 flex justify-center">
          <Button
            variant="outline"
            className="h-11 rounded-full px-8"
            disabled={isLoadingMore}
            onClick={loadMore}
          >
            {isLoadingMore
              ? t("読み込み中…", "Loading…")
              : t("もっと見る", "Load more")}
          </Button>
        </div>
      )}
    </div>
  )
}

const searchTagsQuery = graphql(
  `query SearchPageTags($offset: Int!, $limit: Int!, $where: TagsWhereInput) {
    tags(offset: $offset, limit: $limit, where: $where) {
      id
      name
      firstWork {
        id
        rating
        smallThumbnailImageURL
      }
    }
  }`,
)
