import {
  useApolloClient,
  useQuery,
  useSuspenseQuery,
} from "@apollo/client/index"
import { Link, useNavigate } from "@remix-run/react"
import { type FragmentOf, graphql } from "gql.tada"
import { Loader2Icon, MessageCircleIcon } from "lucide-react"
import {
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { LikeButton } from "~/components/like-button"
import { OptimizedWorkGrid } from "~/components/optimized-work-grid"
import { ResponsivePagination } from "~/components/responsive-pagination"
import {
  PhotoAlbumWorkFragment,
  ResponsivePhotoWorksAlbum,
} from "~/components/responsive-photo-works-album"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Button } from "~/components/ui/button"
/* ────────────────────────────────────────────────────────────
 * Shared components / hooks
 * ─────────────────────────────────────────────────────── */
import { Card, CardContent, CardHeader } from "~/components/ui/card"
import { AuthContext } from "~/contexts/auth-context"
import { useGlobalTimelineView } from "~/hooks/use-global-feed-mode"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import { useInfiniteScroll } from "~/routes/($lang)._main._index/hooks/use-infinite-scroll"
import { usePagedInfinite } from "~/routes/($lang)._main._index/hooks/use-paged-infinite"
import { useScrollRestoration } from "~/routes/($lang)._main._index/hooks/use-scroll-restoration"
import {
  CommentListItemFragment,
  WorkCommentList,
} from "~/routes/($lang)._main.posts.$post._index/components/work-comment-list"
import { toDateTimeText } from "~/utils/to-date-time-text"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

/* -----------------------------------------------------------------
 * Constants & helpers
 * -----------------------------------------------------------------*/
const PER_PAGE = 32

function chunkPosts<T>(arr: T[], size: number): T[][] {
  const res: T[][] = []
  for (let i = 0; i < arr.length; i += size) res.push(arr.slice(i, i + size))
  return res
}

/* -----------------------------------------------------------------
 * GraphQL
 * -----------------------------------------------------------------*/
export const workFieldsFragment = graphql(`
  fragment PartialWorkFields on WorkNode @_unmask {
    id
    title
    largeThumbnailImageURL
    description
    tagNames
    isLiked
    likesCount
    createdAt
    commentsCount
    isCommentsEditable
    user {
      id
      name
      login
      iconUrl
    }
    subWorks {
      imageUrl
    }
  }
`)

const followedTagsPreviewQuery = graphql(`
  query FollowedTagsPreview($limit: Int!) {
    viewer {
      id
      followingTags(offset: 0, limit: $limit) {
        id
        name
      }
    }
  }
`)

const feedQuery = graphql(
  `query TagFeed(
    $limit: Int!
    $offset: Int!
    $feedWhere: FeedWhereInput!
    $feedPostsWhere: FeedPostsWhereInput
  ) {
    feed(where: $feedWhere) {
      posts(limit: $limit, offset: $offset, where: $feedPostsWhere) {
        id
        work {
          ...PartialWorkFields
          comments(offset: 0, limit: 128) {
            ...Comment
          }
        }
      }
    }
  }`,
  [CommentListItemFragment, workFieldsFragment],
)

const feedWorkListQuery = graphql(
  `query TagFeedWorkList(
    $limit: Int!
    $offset: Int!
    $feedWhere: FeedWhereInput!
    $feedPostsWhere: FeedPostsWhereInput
  ) {
    feed(where: $feedWhere) {
      posts(limit: $limit, offset: $offset, where: $feedPostsWhere) {
        id
        work {
          ...PhotoAlbumWork
        }
      }
    }
  }`,
  [PhotoAlbumWorkFragment],
)

/* -----------------------------------------------------------------
 * Types
 * -----------------------------------------------------------------*/
export type PostItem = {
  id: string
  work?:
    | (FragmentOf<typeof workFieldsFragment> & {
        comments?: FragmentOf<typeof CommentListItemFragment>[] | null
      })
    | null
}

export type FollowTagsFeedContentsProps = {
  page: number
  setPage: (p: number) => void
  isPagination: boolean
  onSelect?: (index: string) => void
  updateWorks?: (works: FragmentOf<typeof PhotoAlbumWorkFragment>[]) => void
}

/* -----------------------------------------------------------------
 * Root component
 * -----------------------------------------------------------------*/
export function FollowSensitiveTagsFeedContents({
  page,
  setPage,
  isPagination,
  onSelect,
  updateWorks,
}: FollowTagsFeedContentsProps) {
  const navigate = useNavigate()
  const t = useTranslation()
  const [isTimelineView, setIsTimelineView] = useGlobalTimelineView()

  /* タグプレビュー取得 */
  const { data: tagData, refetch: refetchFollowedTagsPreview } =
    useSuspenseQuery(followedTagsPreviewQuery, {
      variables: { limit: 6 },
    })
  const tags = tagData?.viewer?.followingTags ?? []
  const tagsToShow = tags.slice(0, 5)
  const hasMoreTags = tags.length > 5

  const key = `follow-tags-${isPagination}`

  return (
    <div className="space-y-4">
      {/* --- タイムライン切替 ＋ 管理 --- */}
      <div className="mb-4 flex justify-end space-x-2">
        <Button
          onClick={() => navigate("/settings/followed/tags")}
          variant="secondary"
        >
          {t("管理", "Manage")}
        </Button>
        <Button onClick={() => setIsTimelineView(!isTimelineView)}>
          {isTimelineView
            ? t("一覧形式に切り替え", "Switch to List View")
            : t("タイムライン形式に切り替え", "Switch to Timeline View")}
        </Button>
      </div>

      {/* --- タグ一覧 --- */}
      {tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {tagsToShow.map((tag) => (
            <Link key={tag.id} to={`/r/tags/${tag.name}`}>
              <Button
                size="sm"
                variant="secondary"
                className="rounded-full px-3"
              >
                {tag.name}
              </Button>
            </Link>
          ))}
          {hasMoreTags && <span className="text-sm">…</span>}
        </div>
      )}

      {/* --- フィード本体 --- */}
      {isPagination ? (
        <PaginationMode
          key={key}
          page={page}
          setPage={setPage}
          isTimelineView={isTimelineView}
          setIsTimelineView={setIsTimelineView}
          onSelect={onSelect}
          updateWorks={updateWorks}
        />
      ) : (
        <InfiniteMode
          key={key}
          isTimelineView={isTimelineView}
          setIsTimelineView={setIsTimelineView}
          onSelect={onSelect}
          updateWorks={updateWorks}
        />
      )}
    </div>
  )
}

/* ===============================================================
 * Pagination Mode
 * ===============================================================*/
function PaginationMode({
  page,
  setPage,
  isTimelineView,
  setIsTimelineView,
  onSelect,
  updateWorks,
}: {
  page: number
  setPage: (n: number) => void
  isTimelineView: boolean
  setIsTimelineView: (v: boolean) => void
  onSelect?: (index: string) => void
  updateWorks?: (works: FragmentOf<typeof PhotoAlbumWorkFragment>[]) => void
}) {
  const auth = useContext(AuthContext)
  const _t = useTranslation()
  const [prevDataKey, setPrevDataKey] = useState<string>("")

  const offset = page * PER_PAGE
  const { data, loading, refetch } = useQuery(
    isTimelineView ? feedQuery : feedWorkListQuery,
    {
      skip: auth.isLoading || auth.isNotLoggedIn,
      variables: {
        limit: PER_PAGE,
        offset,
        feedWhere: { userId: auth.userId ?? "-1", type: "FOLLOW_TAG" },
        feedPostsWhere: { ratings: ["R18", "R18G"] },
      },
      fetchPolicy: "cache-and-network",
      errorPolicy: "ignore",
    },
  )

  const posts = data?.feed?.posts ?? []
  useScrollRestoration("follow-tag-pagination", !!posts.length)

  const handlePageChange = (p: number) => {
    setPage(p)
    refetch({ offset: p * PER_PAGE })
  }

  // updateWorksを正しいタイミングで呼ぶ
  useEffect(() => {
    if (!updateWorks || !data?.feed?.posts || isTimelineView) return

    // データの一意性を確認するためのキーを作成
    const dataKey = `${page}-${data.feed.posts.length}-${data.feed.posts.map((p) => p.id).join(",")}`

    if (dataKey !== prevDataKey) {
      // @ts-ignore
      const works = data.feed.posts
        .map((p) => p.work)
        .filter((w) => !!w) as FragmentOf<typeof PhotoAlbumWorkFragment>[]

      updateWorks(works)
      setPrevDataKey(dataKey)
    }
  }, [data?.feed?.posts, updateWorks, page, isTimelineView, prevDataKey])

  if (auth.isLoading) return <Loader />
  if (auth.isNotLoggedIn || !auth.userId) return <NeedLoginMessage />
  if (!loading && posts.length === 0) return <NoDataMessage />

  return (
    <>
      <FeedContent
        posts={posts as PostItem[]}
        isTimelineView={isTimelineView}
        setIsTimelineView={setIsTimelineView}
        onSelect={onSelect}
      />

      <div className="h-8" />
      <div className="-translate-x-1/2 fixed bottom-0 left-1/2 z-10 w-full border-border/40 bg-background/95 p-2 backdrop-blur-sm supports-backdrop-filter:bg-background/80">
        <ResponsivePagination
          perPage={PER_PAGE}
          maxCount={1000}
          currentPage={page}
          onPageChange={handlePageChange}
        />
      </div>
    </>
  )
}

/* ===============================================================
 * Infinite Scroll Mode
 * ===============================================================*/
function InfiniteMode({
  isTimelineView,
  setIsTimelineView,
  onSelect,
  updateWorks,
}: {
  isTimelineView: boolean
  setIsTimelineView: (v: boolean) => void
  onSelect?: (index: string) => void
  updateWorks?: (works: FragmentOf<typeof PhotoAlbumWorkFragment>[]) => void
}) {
  const client = useApolloClient()
  const auth = useContext(AuthContext)
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false)
  const [_prevFlatLength, _setPrevFlatLength] = useState<number>(0)

  const feedWhere = useMemo(
    () => ({ userId: auth.userId ?? "-1", type: "FOLLOW_TAG" as const }),
    [auth.userId],
  )
  const feedPostsWhere = {
    ratings: ["R18", "R18G"] as Array<"G" | "R15" | "R18" | "R18G">,
  }
  const queryVars = { limit: PER_PAGE, offset: 0, feedWhere, feedPostsWhere }
  const QUERY = isTimelineView ? feedQuery : feedWorkListQuery

  /* キャッシュから初期ページ */
  const initialPages = useMemo(() => {
    if (auth.isLoading || auth.isNotLoggedIn) return []
    try {
      const cached = client.readQuery<{ feed?: { posts?: PostItem[] } }>({
        query: QUERY,
        variables: queryVars,
      })
      return cached?.feed?.posts?.length
        ? chunkPosts(cached.feed.posts, PER_PAGE)
        : []
    } catch {
      return []
    }
  }, [client, QUERY, queryVars, auth.isLoading, auth.isNotLoggedIn])

  const {
    data,
    fetchMore,
    loading: loadingFirst,
  } = useQuery(QUERY, {
    skip: auth.isLoading || auth.isNotLoggedIn,
    variables: queryVars,
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
    errorPolicy: "ignore",
  })

  const storeKey = JSON.stringify({
    tv: isTimelineView,
    uid: auth.userId,
    ratings: feedPostsWhere.ratings.join("-"),
  })
  const { pages, appendPage, appendPages, replaceFirstPage, flat } =
    usePagedInfinite<PostItem>(initialPages, storeKey)

  const prevFirstIdsRef = useRef<string>("")

  const flatWorks = useMemo(
    () =>
      flat.map((p) => p.work).filter(Boolean) as FragmentOf<
        typeof PhotoAlbumWorkFragment
      >[],
    [flat],
  )

  /* ─── ❷ updateWorks : 変化検知して一度に渡す ───────── */
  const prevIdsRef = useRef<string>("")

  useEffect(() => {
    const posts = data?.feed?.posts
    if (!posts?.length) return

    /* 1ページ＝32件ごとに分割 */
    const chunked = chunkPosts(posts, PER_PAGE)
    if (!chunked.length) return

    /* 1ページ目の ID 配列を文字列化して比較 */
    const newFirstIds = chunked[0].map((p) => p.id).join(",")

    if (!pages.length || newFirstIds !== prevFirstIdsRef.current) {
      /* 並びが変わっていれば先頭ページを差し替え */
      replaceFirstPage(chunked[0])

      /* 2ページ目以降をまとめて反映 */
      if (chunked.length > 1) appendPages(chunked.slice(1))

      /* 現在の ID を保存して次回比較に使う */
      prevFirstIdsRef.current = newFirstIds
    }
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [data?.feed?.posts, pages.length, replaceFirstPage, appendPages])

  // updateWorksを正しいタイミングで呼ぶ
  useEffect(() => {
    if (!updateWorks || isTimelineView || flatWorks.length === 0) return

    // 先頭から順に ID を連結（順序の変化も検知）
    const ids = flatWorks.map((w) => w.id).join(",")

    if (ids !== prevIdsRef.current) {
      updateWorks(flatWorks) // ← これで全件を親へ
      prevIdsRef.current = ids
    }
  }, [flatWorks, updateWorks, isTimelineView])

  const ready = initialPages.length > 0 || !!data?.feed?.posts?.length
  useScrollRestoration("follow-tag-infinite", ready)

  const hasNext = (pages.at(-1)?.length ?? 0) >= PER_PAGE - 8
  const loadMore = useCallback(async () => {
    if (!hasNext || loadingFirst || isLoadingMore) return
    setIsLoadingMore(true)
    try {
      const res = await fetchMore({
        variables: { ...queryVars, offset: flat.length },
      })
      const newPosts = res.data?.feed?.posts as PostItem[] | undefined
      if (newPosts?.length) appendPage(newPosts)
    } finally {
      setIsLoadingMore(false)
    }
  }, [
    hasNext,
    loadingFirst,
    isLoadingMore,
    fetchMore,
    queryVars,
    flat.length,
    appendPage,
  ])

  const sentinelRef = useInfiniteScroll(loadMore, {
    hasNext,
    loading: loadingFirst,
  })

  if (auth.isLoading) return <Loader />
  if (auth.isNotLoggedIn || !auth.userId) return <NeedLoginMessage />
  if (!loadingFirst && flat.length === 0) return <NoDataMessage />

  return (
    <div className="space-y-8">
      {pages.map((p, idx) => (
        <div key={idx.toString()} className="w-full">
          <FeedContent
            posts={p}
            isTimelineView={isTimelineView}
            setIsTimelineView={setIsTimelineView}
            onSelect={onSelect}
          />
          {/* ページ間の視覚的区切り（最後のページ以外） */}
          {idx < pages.length - 1 && !isTimelineView && (
            <div className="mt-8 border-muted/20 border-t" />
          )}
        </div>
      ))}
      {isLoadingMore && <Loader />}
      {hasNext && <div ref={sentinelRef} style={{ height: 1 }} />}
    </div>
  )
}

/* ===============================================================
 * Feed Content (Timeline / Grid) — タイムライン切り替えボタンは上位で表示済
 * ===============================================================*/
function FeedContent({
  posts,
  isTimelineView,
  setIsTimelineView: _setIsTimelineView,
  onSelect,
}: {
  posts: PostItem[]
  isTimelineView: boolean
  setIsTimelineView: (v: boolean) => void
  onSelect?: (index: string) => void
}) {
  const t = useTranslation()
  const [hiddenComments, setHiddenComments] = useState<Record<string, boolean>>(
    {},
  )
  const [subWorksVisible, setSubWorksVisible] = useState<
    Record<string, boolean>
  >({})

  const works = posts
    .filter(
      (p): p is PostItem & { work: NonNullable<PostItem["work"]> } => !!p.work,
    )
    .map((p) => p.work)
  if (works.length === 0) return null

  const toggleCommentsVisibility = (id: string) =>
    setHiddenComments((prev) => ({ ...prev, [id]: !prev[id] }))
  const toggleSubWorksVisibility = (id: string) =>
    setSubWorksVisible((prev) => ({ ...prev, [id]: !prev[id] }))

  return isTimelineView ? (
    <TimelineView
      works={works}
      t={t}
      hiddenComments={hiddenComments}
      subWorksVisible={subWorksVisible}
      toggleCommentsVisibility={toggleCommentsVisibility}
      toggleSubWorksVisibility={toggleSubWorksVisibility}
      onSelect={onSelect}
      index={posts.findIndex((p) => p.work?.id === works[0].id) ?? 0}
    />
  ) : (
    <GridView works={works} onSelect={onSelect} />
  )
}

/* Timeline View component */
function TimelineView({
  works,
  t,
  hiddenComments,
  subWorksVisible,
  toggleCommentsVisibility,
  toggleSubWorksVisibility,
  onSelect,
  index: _index,
}: {
  works: NonNullable<PostItem["work"]>[]
  t: ReturnType<typeof useTranslation>
  hiddenComments: Record<string, boolean>
  subWorksVisible: Record<string, boolean>
  toggleCommentsVisibility: (id: string) => void
  toggleSubWorksVisibility: (id: string) => void
  onSelect?: (index: string) => void
  index: number
}) {
  return (
    <div className="m-auto w-full space-y-4">
      {works.map((work) => (
        <Card key={work.id} className="rounded-lg border">
          <CardHeader className="m-auto flex max-w-[1200px] justify-start">
            <div className="flex items-center space-x-2">
              <Avatar>
                <AvatarImage
                  className="rounded-full"
                  src={withIconUrlFallback(work.user?.iconUrl)}
                  alt=""
                />
                <AvatarFallback />
              </Avatar>
              <Link
                to={`/users/${work.user?.login}`}
                className="flex items-center space-x-2"
              >
                <div className="font-semibold text-md">{work.user?.name}</div>
                <div className="text-sm">@{work.user?.login}</div>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="m-auto max-w-[1200px]">
            <Suspense fallback={<Loader />}>
              <div className="w-full md:flex md:space-x-8">
                <div className="space-y-2 md:w-1/2 md:max-w-[560px]">
                  <div className="relative">
                    <Link to={`/posts/${work.id}`}>
                      <img
                        src={work.largeThumbnailImageURL}
                        alt={work.title}
                        className="w-full rounded-md"
                      />
                    </Link>
                    {onSelect ? (
                      <button
                        type="button"
                        className="block h-full w-full overflow-hidden rounded"
                        onClick={() => onSelect?.(work.id)}
                      >
                        <Link to={`/posts/${work.id}`}>
                          <img
                            src={work.largeThumbnailImageURL}
                            alt={work.title}
                            className="w-full rounded-md"
                          />
                        </Link>
                      </button>
                    ) : (
                      <Link to={`/posts/${work.id}`}>
                        <img
                          src={work.largeThumbnailImageURL}
                          alt={work.title}
                          className="w-full rounded-md"
                        />
                      </Link>
                    )}

                    {work.subWorks?.length ? (
                      <>
                        {!subWorksVisible[work.id] && (
                          <div className="absolute inset-x-0 bottom-0 h-16 rounded-b-md bg-gradient-to-t from-black/80 to-transparent" />
                        )}
                        <Button
                          className="-translate-x-1/2 absolute bottom-2 left-1/2 transform rounded-full opacity-80"
                          variant="secondary"
                          onClick={() => toggleSubWorksVisibility(work.id)}
                        >
                          {subWorksVisible[work.id]
                            ? t("閉じる", "Close")
                            : t(
                                `もっと見る(${work.subWorks.length})`,
                                `Show More (${work.subWorks.length})`,
                              )}
                        </Button>
                        {subWorksVisible[work.id] &&
                          work.subWorks.map(
                            (sw, i) =>
                              sw.imageUrl && (
                                <Link
                                  key={i.toString()}
                                  to={`/posts/${work.id}`}
                                >
                                  <img
                                    src={sw.imageUrl}
                                    alt={work.title}
                                    className="w-full rounded-md"
                                  />
                                </Link>
                              ),
                          )}
                      </>
                    ) : null}
                  </div>
                  <div className="font-semibold text-md">{work.title}</div>
                  <div>{work.description}</div>
                  <div className="flex items-center space-x-4">
                    <LikeButton
                      size={40}
                      text={t("いいね", "Like")}
                      targetWorkId={work.id}
                      targetWorkOwnerUserId={work.user?.id ?? ""}
                      defaultLiked={work.isLiked}
                      defaultLikedCount={work.likesCount}
                      isBackgroundNone={false}
                      strokeWidth={2}
                    />
                    <Button
                      variant="secondary"
                      className="flex items-center space-x-1"
                      onClick={() => toggleCommentsVisibility(work.id)}
                    >
                      <MessageCircleIcon className="size-5" />
                      <span>{work.commentsCount}</span>
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-x-4">
                    {work.tagNames?.map((tag) => (
                      <Link key={tag} to={`/r/tags/${tag}`} className="p-0">
                        <Button variant="link" className="p-0">
                          {tag}
                        </Button>
                      </Link>
                    ))}
                  </div>
                  <div className="text-sm">
                    {work.createdAt ? toDateTimeText(work.createdAt) : ""}
                  </div>
                </div>
                <div
                  className={cn(
                    hiddenComments[work.id] ? "block" : "hidden",
                    "w-full overflow-y-auto md:block",
                  )}
                >
                  {work.isCommentsEditable && work.comments && (
                    <WorkCommentList
                      workId={work.id}
                      comments={work.comments}
                      defaultShowCommentCount={3}
                      workOwnerIconImageURL={work.user?.iconUrl}
                    />
                  )}
                </div>
              </div>
            </Suspense>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

/* Grid View component */
function GridView({
  works,
  onSelect,
}: {
  works: NonNullable<PostItem["work"]>[]
  onSelect?: (index: string) => void
}) {
  // モバイル最適化: 小さい画面では最適化グリッドを使用
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768

  if (isMobile) {
    const optimizedWorks = works.map((work) => ({
      id: work.id,
      title: work.title,
      imageUrl: work.largeThumbnailImageURL,
      width: 300, // fallback width for mobile
      height: 200, // fallback height for mobile
      userId: work.user?.id,
      userName: work.user?.name,
      userIcon: work.user?.iconUrl ?? undefined,
    }))

    return (
      <div className="m-auto w-full space-y-4">
        <OptimizedWorkGrid
          works={optimizedWorks}
          onWorkClick={onSelect}
          gridCols={3}
          itemHeight={180}
        />
      </div>
    )
  }

  return (
    <div className="m-auto w-full space-y-4">
      <ResponsivePhotoWorksAlbum
        works={works as unknown as FragmentOf<typeof PhotoAlbumWorkFragment>[]}
        isShowProfile
        onSelect={onSelect}
      />
    </div>
  )
}

/* Helper components */
function Loader() {
  return (
    <div className="flex justify-center py-8">
      <Loader2Icon className="size-8 animate-spin text-border" />
    </div>
  )
}

function NeedLoginMessage() {
  const t = useTranslation()
  return (
    <div className="flex h-64 items-center justify-center">
      <p className="text-center">
        {t(
          "ログインすることでユーザやタグをフォローして、タイムラインで作品を楽しむことができます",
          "You can enjoy works on the timeline by following users and tags by logging in",
        )}
      </p>
    </div>
  )
}

function NoDataMessage() {
  const t = useTranslation()
  return (
    <div className="flex h-64 items-center justify-center">
      <p className="text-center">
        {t(
          "まだデータがありません、ユーザやタグをフォローして最新の作品をキャッチアップしましょう！",
          "No data yet, follow users and tags to catch up on the latest works!",
        )}
      </p>
    </div>
  )
}
