import { useQuery, useApolloClient } from "@apollo/client/index"
import { graphql, type FragmentOf } from "gql.tada"
import {
  Suspense,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react"
import { Card, CardHeader, CardContent } from "~/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { AuthContext } from "~/contexts/auth-context"
import { MessageCircleIcon, Loader2Icon } from "lucide-react"
import { Button } from "~/components/ui/button"
import { LikeButton } from "~/components/like-button"
import { Link, useNavigate } from "@remix-run/react"
import { WorkCommentList } from "~/routes/($lang)._main.posts.$post._index/components/work-comment-list"
import { CommentListItemFragment } from "~/routes/($lang)._main.posts.$post._index/components/work-comment-list"
import { cn } from "~/lib/utils"
import { toDateTimeText } from "~/utils/to-date-time-text"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"
import {
  PhotoAlbumWorkFragment,
  ResponsivePhotoWorksAlbum,
} from "~/components/responsive-photo-works-album"
import { useTranslation } from "~/hooks/use-translation"
import { useInfiniteScroll } from "~/routes/($lang)._main._index/hooks/use-infinite-scroll"
import { useScrollRestoration } from "~/routes/($lang)._main._index/hooks/use-scroll-restoration"
import { usePagedInfinite } from "~/routes/($lang)._main._index/hooks/use-paged-infinite"
import { ResponsivePagination } from "~/components/responsive-pagination"

type Props = {
  page: number
  setPage: (page: number) => void
  isPagination?: boolean
  onPaginationModeChange?: (v: boolean) => void
  onSelect?: (index: number) => void
  updateWorks?: (works: FragmentOf<typeof PhotoAlbumWorkFragment>[]) => void
}

const PER_PAGE = 32

type PostItem = {
  id: string
  work?: WorkItem | null
}
type WorkItem = FragmentOf<typeof workFieldsFragment> & {
  comments?: CommentItem[] | null
}

type CommentItem = FragmentOf<typeof CommentListItemFragment>

function chunkPosts(arr: PostItem[], size: number): PostItem[][] {
  const res: PostItem[][] = []
  for (let i = 0; i < arr.length; i += size) res.push(arr.slice(i, i + size))
  return res
}

export function FollowUserFeedContents(props: Props) {
  const [internalIsPagination, setInternalIsPagination] = useState(
    props.isPagination ?? false,
  )

  useEffect(() => {
    if (
      props.isPagination !== undefined &&
      props.isPagination !== internalIsPagination
    ) {
      setInternalIsPagination(props.isPagination)
    }
  }, [props.isPagination, internalIsPagination])

  const key = `follow-user-${internalIsPagination}`

  return (
    <div className="space-y-4">
      {internalIsPagination ? (
        <PaginationMode key={key} {...props} />
      ) : (
        <InfiniteMode key={key} {...props} />
      )}
    </div>
  )
}

/* ===========================================================
   Pagination Mode
   =========================================================== */
function PaginationMode(props: Props) {
  const authContext = useContext(AuthContext)
  const navigate = useNavigate()
  const t = useTranslation()
  const [prevDataKey, setPrevDataKey] = useState<string>("")

  const [isTimelineView, setIsTimelineView] = useState(false)

  const currentPage = props.page ?? 0
  const setPage = props.setPage ?? (() => {})

  const offset = PER_PAGE * currentPage

  const { data, loading, refetch } = useQuery(
    isTimelineView ? feedQuery : feedWorkListQuery,
    {
      skip: authContext.isLoading || authContext.isNotLoggedIn,
      variables: {
        offset: offset,
        limit: PER_PAGE,
        feedWhere: {
          userId: authContext.userId ?? "-1",
          type: "FOLLOW_USER",
        },
        feedPostsWhere: {
          ratings: ["G", "R15"],
        },
      },
      fetchPolicy: "cache-and-network",
      errorPolicy: "ignore",
    },
  )

  const posts = data?.feed?.posts ?? []

  useScrollRestoration("follow-user-pagination", !!posts.length)

  const handlePageChange = (page: number) => {
    setPage(page)
    refetch({
      offset: page * PER_PAGE,
      limit: PER_PAGE,
      feedWhere: {
        userId: authContext.userId ?? "-1",
        type: "FOLLOW_USER",
      },
      feedPostsWhere: {
        ratings: ["G", "R15"],
      },
    })
  }

  // updateWorksを正しいタイミングで呼ぶ
  useEffect(() => {
    if (!props.updateWorks || !data?.feed?.posts || isTimelineView) return

    // データの一意性を確認するためのキーを作成
    const dataKey = `${currentPage}-${data.feed.posts.length}-${data.feed.posts.map((p) => p.id).join(",")}`

    if (dataKey !== prevDataKey) {
      // @ts-ignore
      const works = data.feed.posts
        .map((p) => p.work)
        .filter((w) => !!w) as FragmentOf<typeof PhotoAlbumWorkFragment>[]

      props.updateWorks(works)
      setPrevDataKey(dataKey)
    }
  }, [
    data?.feed?.posts,
    props.updateWorks,
    currentPage,
    isTimelineView,
    prevDataKey,
  ])

  if (authContext.isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2Icon className={"size-8 animate-spin text-border"} />
      </div>
    )
  }

  if (
    authContext.isNotLoggedIn ||
    authContext.userId === undefined ||
    !authContext.userId
  ) {
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

  if (posts.length === 0 && !loading) {
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

  return (
    <div className="space-y-4">
      {loading && posts.length === 0 ? (
        <div className="flex justify-center py-8">
          <Loader2Icon className={"size-8 animate-spin text-border"} />
        </div>
      ) : (
        <FeedContent
          posts={posts}
          isTimelineView={isTimelineView}
          setIsTimelineView={setIsTimelineView}
          navigate={navigate}
          t={t}
          isPagination={true}
          onSelect={props.onSelect}
        />
      )}

      {posts.length > 0 && (
        <>
          <div className="h-8" />
          <div className="-translate-x-1/2 fixed bottom-0 left-1/2 z-10 w-full border-border/40 bg-background/95 p-2 backdrop-blur-sm supports-backdrop-filter:bg-background/80">
            <ResponsivePagination
              perPage={PER_PAGE}
              maxCount={1000}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
          </div>
        </>
      )}
    </div>
  )
}

/* ===========================================================
   Infinite Scroll Mode
   =========================================================== */
function InfiniteMode(props: Props) {
  const client = useApolloClient()
  const authContext = useContext(AuthContext)
  const navigate = useNavigate()
  const t = useTranslation()

  const [isTimelineView, setIsTimelineView] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [prevFlatLength, setPrevFlatLength] = useState<number>(0)

  // ─── クエリ & 共通変数 ───────────────────────────────
  const QUERY = isTimelineView ? feedQuery : feedWorkListQuery
  const feedWhere = useMemo(
    () => ({
      userId: authContext.userId ?? "-1",
      type: "FOLLOW_USER" as const,
    }),
    [authContext.userId],
  )
  const feedPostsWhere = {
    ratings: ["G", "R15"] as Array<"G" | "R15" | "R18" | "R18G">,
  }

  // クエリ引数一式 (キャッシュキー生成にも使う)
  const queryVars = useMemo(
    () => ({
      offset: 0,
      limit: PER_PAGE,
      feedWhere,
      feedPostsWhere,
    }),
    [feedWhere],
  )

  // ─── 初期ページをキャッシュから生成 ──────────────────
  const initialPages = useMemo(() => {
    if (authContext.isLoading || authContext.isNotLoggedIn) return []

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
  }, [
    client,
    QUERY,
    queryVars,
    authContext.isLoading,
    authContext.isNotLoggedIn,
  ])

  // ─── Remote fetch ──────────────────────────────────────
  const {
    data,
    fetchMore,
    loading: loadingFirst,
  } = useQuery(QUERY, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: queryVars,
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
    errorPolicy: "ignore",
  })

  // ─── usePagedInfinite (local store key 付き) ─────────────
  const keyForStore = useMemo(
    () =>
      JSON.stringify({
        tv: isTimelineView,
        uid: authContext.userId,
        ratings: feedPostsWhere.ratings.join("-"),
      }),
    [isTimelineView, authContext.userId],
  )
  const { pages, appendPage, appendPages, replaceFirstPage, flat } =
    usePagedInfinite<PostItem>(initialPages, keyForStore)

  // ─── 初回 / クエリ更新時のページ反映 ──────────────────
  useEffect(() => {
    if (!data?.feed?.posts?.length) return

    const posts = data.feed.posts as PostItem[]
    const chunked = chunkPosts(posts, PER_PAGE)
    if (chunked.length === 0) return

    // 既に同じ長さならスキップして "ちらつき" を防ぐ
    const newIds = chunked[0].map((p) => p.id).join(",")
    const curIds = pages[0]?.map((p) => p.id).join(",")
    if (pages.length === 0 || newIds !== curIds) {
      replaceFirstPage(chunked[0])
      if (chunked.length > 1) appendPages(chunked.slice(1))
    }
  }, [data?.feed?.posts, pages, replaceFirstPage, appendPages])

  // updateWorksを正しいタイミングで呼ぶ
  useEffect(() => {
    if (!props.updateWorks || isTimelineView || flat.length === 0) return

    // データの長さが変わった場合のみ更新
    if (flat.length !== prevFlatLength) {
      const works = flat.map((p) => p.work).filter((w) => !!w) as FragmentOf<
        typeof PhotoAlbumWorkFragment
      >[]

      props.updateWorks(works)
      setPrevFlatLength(flat.length)
    }
  }, [flat, props.updateWorks, isTimelineView, prevFlatLength])

  // ─── スクロール復元 ────────────────────────────────
  const ready = initialPages.length > 0 || !!data?.feed?.posts?.length
  useScrollRestoration("follow-user-infinite", ready)

  // ─── 追加ロード ────────────────────────────────────
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

  // ─── 早期 return (ログイン／空データ系) ──────────────
  if (authContext.isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2Icon className="size-8 animate-spin text-border" />
      </div>
    )
  }
  if (authContext.isNotLoggedIn || !authContext.userId) {
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
  if (flat.length === 0 && !loadingFirst) {
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

  // ─── 描画 ──────────────────────────────────────────
  return (
    <div className="space-y-8">
      {pages.map(
        (pagePosts, idx) =>
          pagePosts.length > 0 && (
            <FeedContent
              key={idx.toString()}
              posts={pagePosts}
              isTimelineView={isTimelineView}
              setIsTimelineView={setIsTimelineView}
              navigate={navigate}
              t={t}
              showControls={idx === 0}
              isPagination={false}
              onSelect={props.onSelect}
            />
          ),
      )}

      {isLoadingMore && (
        <div className="flex justify-center py-4">
          <Loader2Icon className="size-8 animate-spin text-border" />
        </div>
      )}

      {hasNext && (
        <div ref={sentinelRef} style={{ height: 1 } as React.CSSProperties} />
      )}
    </div>
  )
}

/* ===========================================================
   Shared Feed Content Component
   =========================================================== */
type FeedContentProps = {
  posts: PostItem[]
  isTimelineView: boolean
  setIsTimelineView: (value: boolean) => void
  navigate: ReturnType<typeof useNavigate>
  t: ReturnType<typeof useTranslation>
  showControls?: boolean
  isPagination: boolean
  onSelect?: (index: number) => void
}

function FeedContent({
  posts,
  isTimelineView,
  setIsTimelineView,
  navigate,
  t,
  showControls = true,
  isPagination,
  onSelect,
}: FeedContentProps) {
  const [hiddenComments, setHiddenComments] = useState<{
    [key: string]: boolean
  }>({})
  const [subWorksVisible, setSubWorksVisible] = useState<{
    [key: string]: boolean
  }>({})

  const toggleCommentsVisibility = (postId: string) => {
    setHiddenComments((prevState) => ({
      ...prevState,
      [postId]: !prevState[postId],
    }))
  }

  const toggleSubWorksVisibility = (postId: string) => {
    setSubWorksVisible((prevState) => ({
      ...prevState,
      [postId]: !prevState[postId],
    }))
  }

  const works = posts
    .filter((post): post is PostItem & { work: WorkItem } => post?.work != null)
    .map((post) => post.work)

  if (works.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col space-y-4">
      {showControls && (
        <div className="mb-4 flex justify-end space-x-2">
          <Button
            onClick={() => {
              navigate("/following")
            }}
            variant={"secondary"}
          >
            {t("管理", "Manage")}
          </Button>
          <Button onClick={() => setIsTimelineView(!isTimelineView)}>
            {isTimelineView
              ? t("一覧形式に切り替え", "Switch to List View")
              : t("タイムライン形式に切り替え", "Switch to Timeline View")}
          </Button>
        </div>
      )}

      {isTimelineView ? (
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
                    <div className="font-semibold text-md">
                      {work.user?.name}
                    </div>
                    <div className="text-sm">@{work.user?.login}</div>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="m-auto max-w-[1200px]">
                <Suspense
                  fallback={
                    <div className="flex justify-center py-4">
                      <Loader2Icon
                        className={"size-8 animate-spin text-border"}
                      />
                    </div>
                  }
                >
                  <div className="w-full md:flex md:space-x-8">
                    <div className="space-y-2 md:w-1/2 md:max-w-[560px]">
                      <div className="relative">
                        {onSelect ? (
                          <button
                            type="button"
                            className="block h-full w-full overflow-hidden rounded"
                            onClick={() =>
                              onSelect(
                                posts.findIndex((p) => p.work?.id === work.id),
                              )
                            }
                          >
                            <img
                              src={work.largeThumbnailImageURL}
                              alt={work.title}
                              className="w-full rounded-md"
                            />
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
                        {work.subWorks?.length > 0 && (
                          <>
                            {!subWorksVisible[work.id] && (
                              <div className="absolute inset-x-0 bottom-0 h-16 rounded-b-md bg-gradient-to-t from-black/80 to-transparent" />
                            )}
                            <Button
                              className="-translate-x-1/2 absolute bottom-2 left-1/2 transform rounded-full opacity-80"
                              variant={"secondary"}
                              onClick={() => toggleSubWorksVisibility(work.id)}
                            >
                              {!subWorksVisible[work.id]
                                ? t(
                                    `もっと見る(${work.subWorks.length})`,
                                    `Show More (${work.subWorks.length})`,
                                  )
                                : t("閉じる", "Close")}
                            </Button>
                            {subWorksVisible[work.id] &&
                              work.subWorks.map(
                                (subWork, index) =>
                                  subWork.imageUrl && (
                                    <Link
                                      key={index.toString()}
                                      to={`/posts/${work.id}`}
                                    >
                                      <img
                                        src={subWork.imageUrl}
                                        alt={work.title}
                                        className="w-full rounded-md"
                                      />
                                    </Link>
                                  ),
                              )}
                          </>
                        )}
                      </div>
                      <div className="font-semibold text-md">{work.title}</div>
                      <div>{work.description}</div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
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
                        </div>
                        <Button
                          variant={"secondary"}
                          className="flex cursor-pointer items-center space-x-1"
                          onClick={() => toggleCommentsVisibility(work.id)}
                        >
                          <MessageCircleIcon className="size-5" />
                          <p>{work.commentsCount}</p>
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-x-4">
                        {work.tagNames?.map((tagName) => (
                          <Link
                            to={`/tags/${tagName}`}
                            key={tagName}
                            className="p-0"
                          >
                            <Button className="p-0" variant={"link"}>
                              {`#${tagName}`}
                            </Button>
                          </Link>
                        ))}
                      </div>
                      <div className="text-sm">
                        {work.createdAt && toDateTimeText(work.createdAt)}
                      </div>
                    </div>
                    <div
                      className={cn(
                        hiddenComments[work.id] ? "block" : "hidden",
                        "md:block",
                        "w-full overflow-y-auto",
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
      ) : (
        <div className="m-auto w-full space-y-4">
          <ResponsivePhotoWorksAlbum
            works={
              works as unknown as FragmentOf<typeof PhotoAlbumWorkFragment>[]
            }
            isShowProfile={true}
            onSelect={onSelect}
          />
        </div>
      )}
    </div>
  )
}

export const workFieldsFragment = graphql(
  `fragment PartialWorkFields on WorkNode @_unmask {
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
  }`,
)

const feedQuery = graphql(
  `query Feed($limit: Int!, $offset: Int!, $feedWhere: FeedWhereInput!, $feedPostsWhere: FeedPostsWhereInput) {
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
  `query FeedWorkList($limit: Int!, $offset: Int!, $feedWhere: FeedWhereInput!, $feedPostsWhere: FeedPostsWhereInput) {
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
