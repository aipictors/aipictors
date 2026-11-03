import { useMutation, useQuery } from "@apollo/client/index"
import { Link, useSearchParams } from "@remix-run/react"
import { graphql, type ResultOf } from "gql.tada"
import {
  BookmarkIcon,
  CopyIcon,
  EllipsisIcon,
  ExternalLinkIcon,
  EyeIcon,
  HeartIcon,
  LayoutGridIcon,
  ListIcon,
  MessageCircleIcon,
  SearchIcon,
  UserRoundIcon,
  XIcon,
} from "lucide-react"
import { useContext, useEffect, useState } from "react"
import { toast } from "sonner"
import { ResponsivePagination } from "~/components/responsive-pagination"
import { Button } from "~/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { Input } from "~/components/ui/input"
import { Skeleton } from "~/components/ui/skeleton"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import { toResizedImageUrl } from "~/utils/resized-image-url"

const PER_PAGE = 40

const VIEW_STORAGE_KEY = "aipictors.myCollectedView"

const RATING_FILTERS = [
  { value: "all", ja: "すべて", en: "All", ratings: null },
  { value: "g", ja: "全年齢", en: "All ages", ratings: ["G"] },
  { value: "r15", ja: "R-15", en: "R-15", ratings: ["R15"] },
  { value: "r18", ja: "R-18", en: "R-18", ratings: ["R18", "R18G"] },
] as const

type Kind = "bookmarks" | "likes" | "views" | "recommended"

const KIND_TEXTS: Record<
  Kind,
  { emptyJa: string; emptyEn: string; removeJa?: string; removeEn?: string }
> = {
  bookmarks: {
    emptyJa: "ブックマークした作品はまだありません",
    emptyEn: "No bookmarked posts yet",
    removeJa: "ブックマークから外す",
    removeEn: "Remove bookmark",
  },
  likes: {
    emptyJa: "いいねした作品はまだありません",
    emptyEn: "No liked posts yet",
    removeJa: "いいねを外す",
    removeEn: "Remove like",
  },
  views: {
    emptyJa: "閲覧した作品はまだありません",
    emptyEn: "No viewed posts yet",
  },
  recommended: {
    emptyJa: "推薦中の作品はありません",
    emptyEn: "No posts being recommended",
    removeJa: "推薦を取り消す",
    removeEn: "Remove recommendation",
  },
}

/**
 * 検索・年齢種別・ページは URL に残す（戻るボタンや再読み込みで同じ一覧になる）
 */
const useCollectedWorksParams = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  const search = searchParams.get("q") ?? ""
  const rating =
    RATING_FILTERS.find((item) => item.value === searchParams.get("rating")) ??
    RATING_FILTERS[0]
  const page = Math.max(
    Number.parseInt(searchParams.get("page") ?? "0") || 0,
    0,
  )

  const update = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams)
    for (const [key, value] of Object.entries(changes)) {
      if (value === null || value === "") {
        next.delete(key)
      } else {
        next.set(key, value)
      }
    }
    setSearchParams(next, { replace: true, preventScrollReset: true })
  }

  return { search, rating, page, update }
}

type Params = ReturnType<typeof useCollectedWorksParams>

const toWhere = (params: Params) => {
  return {
    ...(params.search !== "" && { search: params.search }),
    ...(params.rating.ratings && { ratings: [...params.rating.ratings] }),
  }
}

type Work = ResultOf<typeof MyCollectedWorkFragment>

type ViewProps = {
  kind: Kind
  params: Params
  works: Work[] | undefined
  count: number | undefined
  isStale: boolean
  onRemove?: (work: Work) => Promise<unknown>
}

function CollectedWorksView(props: ViewProps) {
  const t = useTranslation()
  const { params } = props
  const texts = KIND_TEXTS[props.kind]

  const [layout, setLayout] = useState<"grid" | "list">("grid")

  useEffect(() => {
    if (window.localStorage.getItem(VIEW_STORAGE_KEY) === "list") {
      setLayout("list")
    }
  }, [])

  const changeLayout = (next: "grid" | "list") => {
    setLayout(next)
    window.localStorage.setItem(VIEW_STORAGE_KEY, next)
  }

  const [searchInput, setSearchInput] = useState(params.search)

  useEffect(() => {
    setSearchInput(params.search)
  }, [params.search])

  useEffect(() => {
    if (searchInput === params.search) return
    const timer = setTimeout(() => {
      params.update({ q: searchInput, page: null })
    }, 400)
    return () => clearTimeout(timer)
  }, [searchInput])

  // 最後のページの作品を外し切ったら、前のページに戻す
  useEffect(() => {
    if (params.page > 0 && props.works?.length === 0 && !props.isStale) {
      params.update({ page: String(params.page - 1) })
    }
  }, [params.page, props.works?.length, props.isStale])

  const isFiltered = params.search !== "" || params.rating.value !== "all"

  return (
    <div className="flex flex-col gap-3 pb-2">
      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <div className="relative min-w-0 flex-1">
          <SearchIcon className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 size-4 text-muted-foreground" />
          <Input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder={t("タイトルで検索", "Search by title")}
            aria-label={t("タイトルで検索", "Search by title")}
            className="h-10 pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex min-w-0 flex-1 gap-1 overflow-x-auto [scrollbar-width:none]">
            {RATING_FILTERS.map((item) => (
              <button
                key={item.value}
                type="button"
                aria-pressed={params.rating.value === item.value}
                onClick={() =>
                  params.update({
                    rating: item.value === "all" ? null : item.value,
                    page: null,
                  })
                }
                className={cn(
                  "h-9 shrink-0 rounded-full px-3 font-medium text-sm transition-colors",
                  params.rating.value === item.value
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground hover:text-foreground",
                )}
              >
                {t(item.ja, item.en)}
              </button>
            ))}
          </div>
          <div className="flex shrink-0 rounded-full bg-muted p-0.5">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label={t("グリッド", "Grid")}
              aria-pressed={layout === "grid"}
              onClick={() => changeLayout("grid")}
              className={cn(
                "size-8 rounded-full",
                layout === "grid" && "bg-background shadow-sm",
              )}
            >
              <LayoutGridIcon className="size-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label={t("リスト", "List")}
              aria-pressed={layout === "list"}
              onClick={() => changeLayout("list")}
              className={cn(
                "size-8 rounded-full",
                layout === "list" && "bg-background shadow-sm",
              )}
            >
              <ListIcon className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      <p className="text-muted-foreground text-xs tabular-nums">
        {props.count === undefined
          ? " "
          : t(
              `${props.count.toLocaleString()}件`,
              `${props.count.toLocaleString()} posts`,
            )}
      </p>

      {props.works === undefined && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }, (_, index) => index).map((index) => (
            <Skeleton key={index} className="aspect-square rounded-xl" />
          ))}
        </div>
      )}

      {props.works?.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-muted-foreground text-sm">
            {isFiltered
              ? t("条件に合う作品はありません", "No posts match these filters")
              : t(texts.emptyJa, texts.emptyEn)}
          </p>
          {isFiltered ? (
            <Button
              variant="secondary"
              className="rounded-full"
              onClick={() => {
                setSearchInput("")
                params.update({ q: null, rating: null, page: null })
              }}
            >
              {t("絞り込みを解除", "Clear filters")}
            </Button>
          ) : (
            <Button variant="secondary" className="rounded-full" asChild>
              <Link to="/">{t("作品を見に行く", "Browse posts")}</Link>
            </Button>
          )}
        </div>
      )}

      {props.works !== undefined && props.works.length > 0 && (
        <div
          className={cn("transition-opacity", props.isStale && "opacity-60")}
        >
          {layout === "grid" ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {props.works.map((work) => (
                <WorkGridItem
                  key={work.id}
                  work={work}
                  kind={props.kind}
                  onRemove={props.onRemove}
                />
              ))}
            </div>
          ) : (
            <ul className="divide-y">
              {props.works.map((work) => (
                <WorkListItem
                  key={work.id}
                  work={work}
                  kind={props.kind}
                  onRemove={props.onRemove}
                />
              ))}
            </ul>
          )}
        </div>
      )}

      {(props.count ?? 0) > PER_PAGE && (
        <div className="sticky bottom-0 z-10 mt-1 flex justify-center border-t bg-background/95 py-2 backdrop-blur">
          <ResponsivePagination
            perPage={PER_PAGE}
            maxCount={props.count ?? 0}
            currentPage={params.page}
            maxPages={Math.ceil((props.count ?? 0) / PER_PAGE)}
            onPageChange={(page) =>
              params.update({ page: page === 0 ? null : String(page) })
            }
          />
        </div>
      )}
    </div>
  )
}

const RATING_LABELS: Partial<Record<Work["rating"] & string, string>> = {
  R15: "R-15",
  R18: "R-18",
  R18G: "R-18G",
}

const TYPE_LABELS: Partial<
  Record<Work["type"] & string, { ja: string; en: string }>
> = {
  VIDEO: { ja: "動画", en: "Video" },
  NOVEL: { ja: "小説", en: "Novel" },
  COLUMN: { ja: "コラム", en: "Column" },
}

function WorkBadges(props: { work: Work }) {
  const t = useTranslation()
  const rating = props.work.rating ? RATING_LABELS[props.work.rating] : null
  const type = TYPE_LABELS[props.work.type]

  if (!rating && !type) return null

  return (
    <span className="flex flex-wrap gap-1">
      {rating && (
        <span className="rounded-full bg-rose-600 px-1.5 py-0.5 font-medium text-[10px] text-white leading-none">
          {rating}
        </span>
      )}
      {type && (
        <span className="rounded-full bg-black/70 px-1.5 py-0.5 font-medium text-[10px] text-white leading-none">
          {t(type.ja, type.en)}
        </span>
      )}
    </span>
  )
}

function WorkStats(props: { work: Work; className?: string }) {
  const t = useTranslation()
  const stats = [
    {
      icon: HeartIcon,
      value: props.work.likesCount,
      label: t("いいね", "Likes"),
    },
    {
      icon: BookmarkIcon,
      value: props.work.bookmarksCount,
      label: t("ブックマーク", "Bookmarks"),
    },
    {
      icon: MessageCircleIcon,
      value: props.work.commentsCount,
      label: t("コメント", "Comments"),
    },
    { icon: EyeIcon, value: props.work.viewsCount, label: t("閲覧", "Views") },
  ]

  return (
    <span
      className={cn(
        "flex flex-wrap gap-x-2.5 text-muted-foreground text-xs tabular-nums",
        props.className,
      )}
    >
      {stats.map((stat) => (
        <span
          key={stat.label}
          title={stat.label}
          className="flex items-center gap-0.5"
        >
          <stat.icon className="size-3" />
          {stat.value.toLocaleString()}
        </span>
      ))}
    </span>
  )
}

function WorkAuthor(props: { work: Work }) {
  const user = props.work.user
  if (!user) return null

  return (
    <Link
      to={`/users/${user.login}`}
      className="flex min-w-0 items-center gap-1.5 text-muted-foreground text-xs hover:text-foreground"
    >
      {user.iconUrl && (
        <img
          src={toResizedImageUrl(user.iconUrl, 48) ?? ""}
          alt=""
          loading="lazy"
          className="size-5 shrink-0 rounded-full bg-muted object-cover"
        />
      )}
      <span className="truncate">{user.name}</span>
    </Link>
  )
}

function WorkMenu(props: {
  work: Work
  kind: Kind
  onRemove?: (work: Work) => Promise<unknown>
  className?: string
}) {
  const t = useTranslation()
  const texts = KIND_TEXTS[props.kind]
  const url = `/posts/${props.work.id}`

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          aria-label={t("その他の操作", "More actions")}
          className={cn("size-8 shrink-0 rounded-full", props.className)}
        >
          <EllipsisIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <a href={url} target="_blank" rel="noreferrer">
            <ExternalLinkIcon className="mr-2 size-4" />
            {t("新しいタブで開く", "Open in new tab")}
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => {
            void navigator.clipboard
              .writeText(`${window.location.origin}${url}`)
              .then(() => toast(t("URLをコピーしました", "URL copied")))
          }}
        >
          <CopyIcon className="mr-2 size-4" />
          {t("URLをコピー", "Copy URL")}
        </DropdownMenuItem>
        {props.work.user && (
          <DropdownMenuItem asChild>
            <Link to={`/users/${props.work.user.login}`}>
              <UserRoundIcon className="mr-2 size-4" />
              {t("作者のページ", "Author page")}
            </Link>
          </DropdownMenuItem>
        )}
        {props.onRemove && texts.removeJa && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={() => void props.onRemove?.(props.work)}
            >
              <XIcon className="mr-2 size-4" />
              {t(texts.removeJa, texts.removeEn ?? "")}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

type ItemProps = {
  work: Work
  kind: Kind
  onRemove?: (work: Work) => Promise<unknown>
}

function WorkGridItem(props: ItemProps) {
  const { work } = props

  return (
    <article className="group min-w-0">
      <div className="relative overflow-hidden rounded-xl bg-muted">
        <Link to={`/posts/${work.id}`} aria-label={work.title}>
          <img
            src={toResizedImageUrl(work.smallThumbnailImageURL, 320) ?? ""}
            alt=""
            loading="lazy"
            decoding="async"
            className="aspect-square w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
          />
        </Link>
        <span className="pointer-events-none absolute top-1.5 left-1.5">
          <WorkBadges work={work} />
        </span>
        <WorkMenu
          work={work}
          kind={props.kind}
          onRemove={props.onRemove}
          className="absolute top-1 right-1 bg-background/80 hover:bg-background"
        />
      </div>
      <Link
        to={`/posts/${work.id}`}
        className="mt-1.5 block truncate font-medium text-sm hover:underline"
      >
        {work.title}
      </Link>
      <div className="mt-1">
        <WorkAuthor work={work} />
      </div>
      <WorkStats work={work} className="mt-1" />
    </article>
  )
}

function WorkListItem(props: ItemProps) {
  const { work } = props

  return (
    <li className="flex items-center gap-3 py-2.5">
      <Link
        to={`/posts/${work.id}`}
        className="relative shrink-0 overflow-hidden rounded-lg bg-muted"
      >
        <img
          src={toResizedImageUrl(work.smallThumbnailImageURL, 160) ?? ""}
          alt=""
          loading="lazy"
          decoding="async"
          className="size-16 object-cover md:size-20"
        />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="flex min-w-0 items-center gap-1.5">
          <Link
            to={`/posts/${work.id}`}
            className="truncate font-medium text-sm hover:underline"
          >
            {work.title}
          </Link>
          <WorkBadges work={work} />
        </span>
        <WorkAuthor work={work} />
        <WorkStats work={work} />
      </div>
      <WorkMenu work={work} kind={props.kind} onRemove={props.onRemove} />
    </li>
  )
}

/**
 * 外した作品はすぐ一覧から消し、読み直しが終わるまでの間も戻さない
 */
const useRemovedWorks = (works: Work[] | undefined) => {
  const [removedIds, setRemovedIds] = useState<string[]>([])

  return {
    visibleWorks: works?.filter((work) => !removedIds.includes(work.id)),
    run: async (
      work: Work,
      action: () => Promise<unknown>,
      message: string,
    ) => {
      setRemovedIds((current) => [...current, work.id])
      try {
        await action()
        toast(message)
      } catch (error) {
        setRemovedIds((current) => current.filter((id) => id !== work.id))
        toast.error(error instanceof Error ? error.message : String(error))
      }
    },
  }
}

const toPaging = (params: Params) => {
  return { offset: params.page * PER_PAGE, limit: PER_PAGE }
}

/**
 * ブックマーク一覧
 */
export function MyBookmarksList() {
  const authContext = useContext(AuthContext)
  const t = useTranslation()
  const params = useCollectedWorksParams()
  const skip = authContext.isLoading || authContext.isNotLoggedIn
  const where = toWhere(params)

  const list = useQuery(bookmarkedWorksQuery, {
    skip,
    fetchPolicy: "cache-and-network",
    variables: { ...toPaging(params), where },
  })
  const count = useQuery(bookmarkedWorksCountQuery, {
    skip,
    fetchPolicy: "cache-and-network",
    variables: { where },
  })
  const [deleteFolderWork] = useMutation(deleteFolderWorkMutation)

  const data = list.data ?? list.previousData
  const works = data?.viewer?.bookmarkedWorks
  const { visibleWorks, run } = useRemovedWorks(works)
  const folderId = data?.viewer?.bookmarkFolderId

  return (
    <CollectedWorksView
      kind="bookmarks"
      params={params}
      works={visibleWorks}
      count={(count.data ?? count.previousData)?.viewer?.bookmarkedWorksCount}
      isStale={list.data === undefined}
      onRemove={(work) =>
        run(
          work,
          async () => {
            await deleteFolderWork({
              variables: {
                input: { folderId: folderId ?? "", workId: work.id },
              },
            })
            void list.refetch()
            void count.refetch()
          },
          t("ブックマークから外しました", "Bookmark removed"),
        )
      }
    />
  )
}

/**
 * いいね一覧
 */
export function MyLikesList() {
  const authContext = useContext(AuthContext)
  const t = useTranslation()
  const params = useCollectedWorksParams()
  const skip = authContext.isLoading || authContext.isNotLoggedIn
  const where = toWhere(params)

  const list = useQuery(likedWorksQuery, {
    skip,
    fetchPolicy: "cache-and-network",
    variables: { ...toPaging(params), where },
  })
  const count = useQuery(likedWorksCountQuery, {
    skip,
    fetchPolicy: "cache-and-network",
    variables: { where },
  })
  const [deleteWorkLike] = useMutation(deleteWorkLikeMutation)

  const works = (list.data ?? list.previousData)?.viewer?.likedWorks
  const { visibleWorks, run } = useRemovedWorks(works)

  return (
    <CollectedWorksView
      kind="likes"
      params={params}
      works={visibleWorks}
      count={(count.data ?? count.previousData)?.viewer?.likedWorksCount}
      isStale={list.data === undefined}
      onRemove={(work) =>
        run(
          work,
          async () => {
            await deleteWorkLike({ variables: { input: { workId: work.id } } })
            void list.refetch()
            void count.refetch()
          },
          t("いいねを外しました", "Like removed"),
        )
      }
    />
  )
}

/**
 * 閲覧履歴
 */
export function MyViewsList() {
  const authContext = useContext(AuthContext)
  const params = useCollectedWorksParams()
  const skip = authContext.isLoading || authContext.isNotLoggedIn
  const where = toWhere(params)

  const list = useQuery(viewedWorksQuery, {
    skip,
    fetchPolicy: "cache-and-network",
    variables: { ...toPaging(params), where },
  })
  const count = useQuery(viewedWorksCountQuery, {
    skip,
    fetchPolicy: "cache-and-network",
    variables: { where },
  })

  return (
    <CollectedWorksView
      kind="views"
      params={params}
      works={(list.data ?? list.previousData)?.viewer?.viewedWorks}
      count={(count.data ?? count.previousData)?.viewer?.viewedWorksCount}
      isStale={list.data === undefined}
    />
  )
}

/**
 * 推薦した作品
 */
export function MyRecommendedList() {
  const authContext = useContext(AuthContext)
  const t = useTranslation()
  const params = useCollectedWorksParams()
  const skip = authContext.isLoading || authContext.isNotLoggedIn
  const where = toWhere(params)

  const list = useQuery(recommendedWorksQuery, {
    skip,
    fetchPolicy: "cache-and-network",
    variables: { ...toPaging(params), where },
  })
  const count = useQuery(recommendedWorksCountQuery, {
    skip,
    fetchPolicy: "cache-and-network",
    variables: { where },
  })
  const [deleteRecommendedWork] = useMutation(deleteRecommendedWorkMutation)

  const works = (list.data ?? list.previousData)?.viewer?.recommendedWorks
  const { visibleWorks, run } = useRemovedWorks(works)

  return (
    <CollectedWorksView
      kind="recommended"
      params={params}
      works={visibleWorks}
      count={(count.data ?? count.previousData)?.viewer?.recommendedWorksCount}
      isStale={list.data === undefined}
      onRemove={(work) =>
        run(
          work,
          async () => {
            await deleteRecommendedWork({
              variables: { input: { workId: work.id } },
            })
            void list.refetch()
            void count.refetch()
          },
          t("推薦を取り消しました", "Recommendation removed"),
        )
      }
    />
  )
}

export const MyCollectedWorkFragment = graphql(
  `fragment MyCollectedWork on WorkNode @_unmask {
    id
    title
    type
    rating
    smallThumbnailImageURL
    likesCount
    bookmarksCount
    commentsCount
    viewsCount
    user {
      id
      login
      name
      iconUrl
    }
  }`,
)

const bookmarkedWorksQuery = graphql(
  `query ViewerBookmarkedWorks($offset: Int!, $limit: Int!, $where: UserWorksWhereInput) {
    viewer {
      id
      bookmarkFolderId
      bookmarkedWorks(offset: $offset, limit: $limit, where: $where) {
        ...MyCollectedWork
      }
    }
  }`,
  [MyCollectedWorkFragment],
)

const bookmarkedWorksCountQuery = graphql(
  `query ViewerBookmarkedWorksCount($where: UserWorksWhereInput) {
    viewer {
      id
      bookmarkedWorksCount(where: $where)
    }
  }`,
)

const likedWorksQuery = graphql(
  `query ViewerLikedWorks($offset: Int!, $limit: Int!, $where: UserWorksWhereInput) {
    viewer {
      id
      likedWorks(offset: $offset, limit: $limit, where: $where) {
        ...MyCollectedWork
      }
    }
  }`,
  [MyCollectedWorkFragment],
)

const likedWorksCountQuery = graphql(
  `query ViewerLikedWorksCount($where: UserWorksWhereInput) {
    viewer {
      id
      likedWorksCount(where: $where)
    }
  }`,
)

const viewedWorksQuery = graphql(
  `query ViewerViewedWorks($offset: Int!, $limit: Int!, $where: UserWorksWhereInput) {
    viewer {
      id
      viewedWorks(offset: $offset, limit: $limit, where: $where) {
        ...MyCollectedWork
      }
    }
  }`,
  [MyCollectedWorkFragment],
)

const viewedWorksCountQuery = graphql(
  `query ViewerViewedWorksCount($where: UserWorksWhereInput) {
    viewer {
      id
      viewedWorksCount(where: $where)
    }
  }`,
)

const recommendedWorksQuery = graphql(
  `query ViewerRecommendedWorks($offset: Int!, $limit: Int!, $where: UserWorksWhereInput) {
    viewer {
      id
      recommendedWorks(offset: $offset, limit: $limit, where: $where) {
        ...MyCollectedWork
      }
    }
  }`,
  [MyCollectedWorkFragment],
)

const recommendedWorksCountQuery = graphql(
  `query ViewerRecommendedWorksCount($where: UserWorksWhereInput) {
    viewer {
      id
      recommendedWorksCount(where: $where)
    }
  }`,
)

const deleteFolderWorkMutation = graphql(
  `mutation DeleteMyBookmark($input: DeleteFolderWorkInput!) {
    deleteFolderWork(input: $input) {
      id
    }
  }`,
)

const deleteWorkLikeMutation = graphql(
  `mutation DeleteMyWorkLike($input: DeleteWorkLikeInput!) {
    deleteWorkLike(input: $input) {
      id
      isLiked
      likesCount
    }
  }`,
)

const deleteRecommendedWorkMutation = graphql(
  `mutation DeleteMyRecommendedWork($input: DeleteRecommendedWorkInput!) {
    deleteRecommendedWork(input: $input)
  }`,
)
