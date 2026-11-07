import { useApolloClient, useQuery } from "@apollo/client/index"
import { type FragmentOf, graphql } from "gql.tada"
import { Loader2Icon, SparklesIcon } from "lucide-react"
import { useCallback, useContext, useEffect, useMemo, useState } from "react"
import {
  PhotoAlbumWorkFragment,
  ResponsivePhotoWorksAlbum,
} from "~/components/responsive-photo-works-album"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { useViewerRatings } from "~/hooks/use-viewer-ratings"
import { Link } from "~/lib/app/locale-router"
import { HomeNewWorksSkeleton } from "~/routes/($lang)._main._index/components/home-new-works-skeleton"
import { useInfiniteScroll } from "~/routes/($lang)._main._index/hooks/use-infinite-scroll"

export const RECOMMENDED_PER_PAGE = 32

type Work = FragmentOf<typeof PhotoAlbumWorkFragment>

type Props = {
  /** サーバーで取ったログインしていない人向けの最初の一覧（すぐ出すため） */
  initialWorks: Work[]
  onSelect?: (index: string) => void
  updateWorks?: (works: Work[]) => void
}

/**
 * 「おすすめ」の一覧（続けてスクロールで読み込む）
 * ログイン中はフォロー・いいねの傾向に合わせた並び、ログインしていなければ反応の勢いと新しさの並び
 */
export function RecommendedFeedContents(props: Props) {
  const t = useTranslation()
  const authContext = useContext(AuthContext)
  const viewerRatings = useViewerRatings()

  // おすすめは全年齢・R15 の中から（R18 は R18 のページで見る）
  const ratings = useMemo(
    () =>
      viewerRatings.normalRatings.filter(
        (rating) => rating === "G" || rating === "R15",
      ),
    [viewerRatings.normalRatings],
  )

  const isGuestList = authContext.isNotLoggedIn
  const canUseInitial =
    isGuestList && ratings.includes("G") && ratings.includes("R15")

  const client = useApolloClient()

  const { data, loading, error } = useQuery(recommendedFeedWorksQuery, {
    skip: authContext.isLoading || !viewerRatings.isReady || canUseInitial,
    variables: { offset: 0, limit: RECOMMENDED_PER_PAGE, ratings },
    // 並びは人ごとに変わるので、毎回取り直す
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
  })

  const [extraWorks, setExtraWorks] = useState<Work[]>([])
  const [hasNext, setHasNext] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const baseWorks = canUseInitial
    ? props.initialWorks
    : (data?.recommendedFeedWorks ?? [])

  const works = useMemo(() => {
    const seen = new Set<string>()
    return [...baseWorks, ...extraWorks].filter((work) => {
      if (seen.has(work.id)) return false
      seen.add(work.id)
      return true
    })
  }, [baseWorks, extraWorks])

  const { updateWorks } = props
  useEffect(() => {
    updateWorks?.(works)
  }, [works, updateWorks])

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasNext) return
    setIsLoadingMore(true)
    try {
      const result = await client.query({
        query: recommendedFeedWorksQuery,
        variables: {
          offset: works.length,
          limit: RECOMMENDED_PER_PAGE,
          ratings: canUseInitial ? ["G", "R15"] : ratings,
        },
        fetchPolicy: "network-only",
      })
      const next = result.data?.recommendedFeedWorks ?? []
      setExtraWorks((current) => [...current, ...next])
      if (next.length < RECOMMENDED_PER_PAGE) setHasNext(false)
    } catch {
      setHasNext(false)
    } finally {
      setIsLoadingMore(false)
    }
  }, [isLoadingMore, hasNext, client, works.length, canUseInitial, ratings])

  const sentinelRef = useInfiniteScroll(() => void loadMore(), {
    hasNext: hasNext && works.length > 0,
    loading: isLoadingMore,
  })

  if (works.length === 0 && (loading || authContext.isLoading)) {
    return <HomeNewWorksSkeleton view="new" isPagination={false} />
  }

  if (works.length === 0) {
    return (
      <p className="py-10 text-center text-muted-foreground text-sm">
        {error
          ? t(
              "おすすめを読み込めませんでした。少し待ってから開き直してください",
              "Could not load recommendations. Please try again later",
            )
          : t("ここ数日の作品がまだありません", "No recent works yet")}
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {authContext.isLoggedIn ? (
        <p className="flex items-center gap-1.5 text-muted-foreground text-xs">
          <SparklesIcon className="size-3.5" />
          {t(
            "ここ3日の新しい作品から、フォローやいいねに合わせて選んでいます。いいね・フォロー・お気に入りタグを増やすほど、あなた向けになります",
            "Picked from the last 3 days based on your follows and likes",
          )}
        </p>
      ) : (
        <p className="flex items-center gap-1.5 text-muted-foreground text-xs">
          <SparklesIcon className="size-3.5" />
          {t(
            "ここ3日の新しい作品から、反応の多いものを選んでいます。",
            "Popular works from the last 3 days.",
          )}
          <Link to="/login" className="underline">
            {t(
              "ログインすると、あなた向けのおすすめになります",
              "Log in for personal picks",
            )}
          </Link>
        </p>
      )}
      <ResponsivePhotoWorksAlbum
        works={works}
        isShowProfile={true}
        onSelect={props.onSelect}
        priorityCount={8}
      />
      <div ref={sentinelRef} className="h-10" />
      {isLoadingMore && (
        <div className="flex justify-center py-4">
          <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
        </div>
      )}
      {!hasNext && (
        <p className="py-6 text-center text-muted-foreground text-sm">
          {t(
            "ここ3日のおすすめは以上です。もっと見るなら",
            "That's all for the last 3 days. See more in",
          )}
          <Link to="/new-works" className="mx-1 underline">
            {t("新着", "New")}
          </Link>
          {t("へ", "")}
        </p>
      )}
    </div>
  )
}

export const recommendedFeedWorksQuery = graphql(
  `query RecommendedFeedWorks($offset: Int!, $limit: Int!, $ratings: [Rating!]) {
    recommendedFeedWorks(offset: $offset, limit: $limit, ratings: $ratings) {
      ...PhotoAlbumWork
    }
  }`,
  [PhotoAlbumWorkFragment],
)
