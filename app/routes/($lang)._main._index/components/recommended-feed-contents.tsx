import { useApolloClient, useQuery } from "@apollo/client/index"
import { type FragmentOf, graphql } from "gql.tada"
import { EyeOffIcon, Loader2Icon, SparklesIcon } from "lucide-react"
import { toast } from "sonner"
import {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import {
  PhotoAlbumWorkFragment,
  ResponsivePhotoWorksAlbum,
} from "~/components/responsive-photo-works-album"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { useViewerRatings } from "~/hooks/use-viewer-ratings"
import { Link } from "~/lib/app/locale-router"
import { HomeNewWorksSkeleton } from "~/routes/($lang)._main._index/components/home-new-works-skeleton"
import { RecommendedFeedShelf } from "~/routes/($lang)._main._index/components/recommended-feed-shelf"
import { useFeedEvents } from "~/routes/($lang)._main._index/hooks/use-feed-events"
import { useInfiniteScroll } from "~/routes/($lang)._main._index/hooks/use-infinite-scroll"

export const RECOMMENDED_PER_PAGE = 32

/** 一覧を区切って、途中に棚（フォロー新着・お気に入りタグ新着）を差し込む位置 */
const SHELF_AT = [24, 56]

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

  // ログインしていない人と、ログイン状態を確認中（サーバーでの描画を含む）は、サーバーで取った一覧を出す
  const isPersonal = authContext.isLoggedIn && viewerRatings.isReady

  const client = useApolloClient()

  const { data, loading, error } = useQuery(recommendedFeedWorksQuery, {
    skip: !isPersonal,
    variables: { offset: 0, limit: RECOMMENDED_PER_PAGE, ratings },
    // 並びは人ごとに変わるので、毎回取り直す
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
  })

  const [extraWorks, setExtraWorks] = useState<Work[]>([])
  const [hasNext, setHasNext] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // あなた向けの並びが届くまでは、サーバーで取った一覧を出しておく
  const personalWorks = data?.recommendedFeedWorks
  const isUsingInitial = !isPersonal || personalWorks === undefined
  const baseWorks = isUsingInitial ? props.initialWorks : personalWorks

  // 並びが入れ替わったら、続きの読み込みもやり直す
  // biome-ignore lint/correctness/useExhaustiveDependencies: 入れ替わったときだけ
  useEffect(() => {
    setExtraWorks([])
    setHasNext(true)
  }, [isUsingInitial])

  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set())

  const works = useMemo(() => {
    const seen = new Set<string>()
    return [...baseWorks, ...extraWorks].filter((work) => {
      if (seen.has(work.id) || hiddenIds.has(work.id)) return false
      seen.add(work.id)
      return true
    })
  }, [baseWorks, extraWorks, hiddenIds])

  // 見た・開いた・興味なしを記録して、おすすめの並べ替えと学習に使う
  const feedEvents = useFeedEvents()
  const listRef = useRef<HTMLDivElement>(null)
  const { observe } = feedEvents
  // biome-ignore lint/correctness/useExhaustiveDependencies: 一覧が出たときに見張り始める
  useEffect(() => observe(listRef.current), [observe, works.length > 0])

  const onHide = useCallback(
    (workId: string) => {
      feedEvents.record(workId, "HIDE")
      setHiddenIds((current) => new Set(current).add(workId))
      toast(
        t(
          "この作品を表示しないようにしました。似た作品も出にくくなります",
          "Hidden. Similar works will appear less often",
        ),
      )
    },
    [feedEvents, t],
  )

  const onSelect = props.onSelect
    ? (workId: string) => {
        feedEvents.record(workId, "CLICK")
        props.onSelect?.(workId)
      }
    : undefined

  const renderHideButton = (workId: string) =>
    authContext.isLoggedIn ? (
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          onHide(workId)
        }}
        title={t("興味なし", "Not interested")}
        aria-label={t("興味なし", "Not interested")}
        className="absolute top-1.5 right-1.5 z-20 flex size-7 items-center justify-center rounded-full bg-black/55 text-white opacity-0 transition-opacity focus:opacity-100 group-hover/item:opacity-100 [@media(hover:none)]:opacity-70 hover:bg-black/75"
      >
        <EyeOffIcon className="size-3.5" />
      </button>
    ) : null

  const chunks = useMemo(() => {
    const result: Work[][] = []
    let start = 0
    for (const end of [...SHELF_AT, Number.POSITIVE_INFINITY]) {
      const chunk = works.slice(start, end)
      if (chunk.length > 0) result.push(chunk)
      start = end
    }
    return result
  }, [works])

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
          ratings: isUsingInitial ? ["G", "R15"] : ratings,
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
  }, [isLoadingMore, hasNext, client, works.length, isUsingInitial, ratings])

  const sentinelRef = useInfiniteScroll(() => void loadMore(), {
    hasNext: hasNext && works.length > 0,
    loading: isLoadingMore,
  })

  if (works.length === 0 && loading) {
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
      {/* biome-ignore lint/a11y/noStaticElementInteractions: 開いた作品を記録するだけ（操作は中のリンクとボタン） */}
      <div
        ref={listRef}
        className="space-y-6"
        onClickCapture={(event) => {
          const link = (event.target as HTMLElement).closest(
            "a[href*='/posts/']",
          )
          const workId = link
            ?.getAttribute("href")
            ?.match(/\/posts\/(\d+)/)?.[1]
          if (workId) feedEvents.record(workId, "CLICK")
        }}
      >
        {chunks.map((chunk, index) => (
          <Fragment key={chunk[0]?.id ?? index}>
            <ResponsivePhotoWorksAlbum
              works={chunk}
              isShowProfile={true}
              onSelect={onSelect}
              priorityCount={index === 0 ? 8 : 0}
              renderItemOverlay={renderHideButton}
            />
            {index === 0 && chunks.length > 1 && (
              <RecommendedFeedShelf
                type="FOLLOW_USER"
                title={t("フォロー新着", "From people you follow")}
                link="/follow-user-works"
              />
            )}
            {index === 1 && chunks.length > 2 && (
              <RecommendedFeedShelf
                type="FOLLOW_TAG"
                title={t("お気に入りタグの新着", "From your favorite tags")}
                link="/follow-tag-works"
              />
            )}
          </Fragment>
        ))}
      </div>
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
