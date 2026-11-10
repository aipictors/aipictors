import { useLocation, useSearchParams } from "@remix-run/react"
import { type FragmentOf, graphql } from "gql.tada"
import {
  LayoutGridIcon,
  ListIcon,
  RefreshCwIcon,
  UsersIcon,
} from "lucide-react"
import { useContext } from "react"
import { FollowButton } from "~/components/button/follow-button"
import { LikeButton } from "~/components/like-button"
import { LoginDialogButton } from "~/components/login-dialog-button"
import { ResponsivePagination } from "~/components/responsive-pagination"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { Skeleton } from "~/components/ui/skeleton"
import { UserAvatarWithFrame } from "~/components/user/user-avatar-with-frame"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { cn } from "~/lib/utils"
import { toResizedImageUrl } from "~/utils/resized-image-url"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

type Kind = "following" | "followers"

type Mode = "default" | "simple"

type OrderBy =
  | "DATE_FOLLOWED"
  | "DATE_POSTED"
  | "DATE_UPDATED"
  | "DATE_CREATED"

type Sort = "ASC" | "DESC"

const PER_PAGE_OPTIONS = [24, 48, 96]

const DEFAULT_PER_PAGE = 24

const SORT_OPTIONS: { orderBy: OrderBy; sort: Sort }[] = [
  { orderBy: "DATE_FOLLOWED", sort: "DESC" },
  { orderBy: "DATE_FOLLOWED", sort: "ASC" },
  { orderBy: "DATE_POSTED", sort: "DESC" },
  { orderBy: "DATE_UPDATED", sort: "DESC" },
  { orderBy: "DATE_CREATED", sort: "DESC" },
  { orderBy: "DATE_CREATED", sort: "ASC" },
]

const toSortValue = (option: { orderBy: OrderBy; sort: Sort }) =>
  `${option.orderBy}:${option.sort}`

export const FollowRelationUserFragment = graphql(
  `fragment FollowRelationUser on UserNode @_unmask {
    id
    name
    iconUrl
    avatarFrame {
      id
      frameType
      backgroundStyle
      overlayImageUrl
      borderPadding
    }
    biography
    isFollowee
    isFollower
    finalPostedAt
  }`,
)

export const FollowRelationWorkFragment = graphql(
  `fragment FollowRelationWork on WorkNode @_unmask {
    id
    title
    enTitle
    smallThumbnailImageURL
    isLiked
    user {
      id
    }
  }`,
)

type RelationUser = FragmentOf<typeof FollowRelationUserFragment> & {
  works?: FragmentOf<typeof FollowRelationWorkFragment>[]
}

/**
 * URL から一覧の表示条件を読む（古い URL の値は使える値に丸める）
 */
export function useFollowRelationParams() {
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()

  const mode: Mode = searchParams.get("mode") === "simple" ? "simple" : "default"

  const page = Math.max(
    Number.parseInt(searchParams.get("page") ?? "0", 10) || 0,
    0,
  )

  const requestedPerPage = Number.parseInt(searchParams.get("perPage") ?? "", 10)
  const perPage = PER_PAGE_OPTIONS.includes(requestedPerPage)
    ? requestedPerPage
    : DEFAULT_PER_PAGE

  const sortOption =
    SORT_OPTIONS.find(
      (option) =>
        option.orderBy === searchParams.get("orderBy") &&
        option.sort === searchParams.get("sort"),
    ) ?? SORT_OPTIONS[0]

  const isSensitivePage = /(^|\/)r(\/|$)/.test(location.pathname)

  const update = (values: Record<string, string>) => {
    const next = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(values)) {
      next.set(key, value)
    }
    setSearchParams(next)
  }

  return {
    mode,
    page,
    perPage,
    orderBy: sortOption.orderBy,
    sort: sortOption.sort,
    isSensitivePage,
    worksWhere: {
      ratings: isSensitivePage
        ? ["R18" as const, "R18G" as const]
        : ["G" as const, "R15" as const],
    },
    setMode: (value: Mode) => update({ mode: value }),
    setPage: (value: number) => update({ page: value.toString() }),
    setPerPage: (value: string) => update({ perPage: value, page: "0" }),
    setSortValue: (value: string) => {
      const [orderBy, sort] = value.split(":")
      update({ orderBy, sort, page: "0" })
    },
  }
}

type Props = {
  kind: Kind
  params: ReturnType<typeof useFollowRelationParams>
  users: RelationUser[] | undefined
  followingCount: number | undefined
  followersCount: number | undefined
  isLoading: boolean
  hasError: boolean
  onRefresh: () => void
}

/**
 * フォロー中・フォロワーの一覧（スマホとPCで同じ構造を使う）
 */
export function FollowRelationView(props: Props) {
  const t = useTranslation()
  const authContext = useContext(AuthContext)
  const { kind, params, users } = props

  const total =
    (kind === "following" ? props.followingCount : props.followersCount) ?? 0

  const prefix = params.isSensitivePage ? "/r" : ""
  const modeQuery = params.mode === "simple" ? "?mode=simple" : ""

  const sortLabel = (option: { orderBy: OrderBy; sort: Sort }) => {
    switch (toSortValue(option)) {
      case "DATE_FOLLOWED:ASC":
        return kind === "following"
          ? t("フォローが古い順", "Oldest follow")
          : t("フォローされたのが古い順", "Oldest follower")
      case "DATE_POSTED:DESC":
        return t("最近投稿した順", "Recently posted")
      case "DATE_UPDATED:DESC":
        return t("最近更新した順", "Recently updated")
      case "DATE_CREATED:DESC":
        return t("登録が新しい順", "Newest account")
      case "DATE_CREATED:ASC":
        return t("登録が古い順", "Oldest account")
      default:
        return kind === "following"
          ? t("最近フォローした順", "Recently followed")
          : t("最近フォローされた順", "Newest follower")
    }
  }

  if (authContext.isNotLoggedIn) {
    return (
      <div className="flex flex-col items-center gap-4 px-4 py-24 text-center">
        <UsersIcon className="size-10 text-muted-foreground" />
        <p className="text-muted-foreground text-sm">
          {t(
            "ログインするとフォロー中のユーザーとフォロワーを確認できます",
            "Log in to see who you follow and your followers",
          )}
        </p>
        <LoginDialogButton label={t("ログイン", "Log in")} />
      </div>
    )
  }

  const showSkeleton = users === undefined && !props.hasError

  return (
    <div className="mx-auto w-full max-w-5xl px-3 pb-10 md:px-6">
      <h1 className="sr-only">
        {kind === "following" ? t("フォロー中", "Following") : t("フォロワー", "Followers")}
      </h1>

      <nav
        className="flex border-border border-b"
        aria-label={t("フォローの一覧", "Follow lists")}
      >
        <RelationTab
          to={`${prefix}/following${modeQuery}`}
          label={t("フォロー中", "Following")}
          count={props.followingCount}
          isActive={kind === "following"}
        />
        <RelationTab
          to={`${prefix}/followers${modeQuery}`}
          label={t("フォロワー", "Followers")}
          count={props.followersCount}
          isActive={kind === "followers"}
        />
      </nav>

      <div className="flex items-center gap-2 py-3">
        <Select
          value={toSortValue({ orderBy: params.orderBy, sort: params.sort })}
          onValueChange={params.setSortValue}
        >
          <SelectTrigger
            className="h-9 min-w-0 flex-1 sm:w-56 sm:flex-none"
            aria-label={t("並び順", "Sort order")}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={toSortValue(option)} value={toSortValue(option)}>
                {sortLabel(option)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={params.perPage.toString()}
          onValueChange={params.setPerPage}
        >
          <SelectTrigger
            className="h-9 w-[84px] shrink-0"
            aria-label={t("表示件数", "Items per page")}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PER_PAGE_OPTIONS.map((option) => (
              <SelectItem key={option} value={option.toString()}>
                {t(`${option}件`, `${option}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="ml-auto flex shrink-0 items-center gap-1">
          <div className="flex rounded-md border border-border p-0.5">
            <ModeButton
              label={t("作品つきで表示", "Show with works")}
              isActive={params.mode === "default"}
              onClick={() => params.setMode("default")}
            >
              <LayoutGridIcon className="size-4" />
            </ModeButton>
            <ModeButton
              label={t("シンプルに表示", "Compact view")}
              isActive={params.mode === "simple"}
              onClick={() => params.setMode("simple")}
            >
              <ListIcon className="size-4" />
            </ModeButton>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-9"
            aria-label={t("更新", "Refresh")}
            disabled={props.isLoading}
            onClick={props.onRefresh}
          >
            <RefreshCwIcon
              className={cn("size-4", props.isLoading && "animate-spin")}
            />
          </Button>
        </div>
      </div>

      {showSkeleton && <RelationSkeleton mode={params.mode} />}

      {props.hasError && users === undefined && (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <p className="text-muted-foreground text-sm">
            {t("読み込めませんでした", "Failed to load")}
          </p>
          <Button variant="secondary" onClick={props.onRefresh}>
            {t("もう一度読み込む", "Try again")}
          </Button>
        </div>
      )}

      {users !== undefined && total === 0 && (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <UsersIcon className="size-10 text-muted-foreground" />
          <p className="text-muted-foreground text-sm">
            {kind === "following"
              ? t("まだ誰もフォローしていません", "You aren't following anyone yet")
              : t("まだフォロワーはいません", "No followers yet")}
          </p>
          {kind === "following" && (
            <Button asChild variant="secondary">
              <Link to="/">{t("作品を見に行く", "Explore works")}</Link>
            </Button>
          )}
        </div>
      )}

      {users !== undefined && params.mode === "default" && (
        <div className="space-y-3">
          {users.map((user) => (
            <RelationCard key={user.id} user={user} kind={kind} />
          ))}
        </div>
      )}

      {users !== undefined && params.mode === "simple" && (
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {users.map((user) => (
            <RelationRow key={user.id} user={user} kind={kind} />
          ))}
        </div>
      )}

      {total > params.perPage && (
        <div className="mt-6">
          <ResponsivePagination
            perPage={params.perPage}
            maxCount={total}
            currentPage={params.page}
            onPageChange={params.setPage}
          />
        </div>
      )}
    </div>
  )
}

function RelationTab(props: {
  to: string
  label: string
  count: number | undefined
  isActive: boolean
}) {
  return (
    <Link
      to={props.to}
      aria-current={props.isActive ? "page" : undefined}
      className={cn(
        "-mb-px flex-1 border-b-2 px-4 py-3 text-center text-sm md:flex-none md:min-w-40",
        props.isActive
          ? "border-primary font-bold text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground",
      )}
    >
      {props.label}
      {props.count !== undefined && (
        <span className="ml-1.5 tabular-nums">
          {props.count.toLocaleString()}
        </span>
      )}
    </Link>
  )
}

function ModeButton(props: {
  label: string
  isActive: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={props.label}
      aria-pressed={props.isActive}
      title={props.label}
      onClick={props.onClick}
      className={cn(
        "flex size-8 items-center justify-center rounded",
        props.isActive
          ? "bg-secondary text-foreground"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {props.children}
    </button>
  )
}

function RelationIdentity(props: {
  user: RelationUser
  bioClassName: string
  showLastPosted: boolean
}) {
  const t = useTranslation()
  const { user } = props

  const lastPosted =
    props.showLastPosted &&
    user.finalPostedAt &&
    user.finalPostedAt * 1000 <= Date.now()
      ? new Date(user.finalPostedAt * 1000).toLocaleDateString()
      : null

  return (
    <Link
      to={`/users/${user.id}`}
      className="flex min-w-0 flex-1 items-start gap-3"
    >
      <UserAvatarWithFrame
        alt={user.name}
        frame={user.avatarFrame}
        isAnimated={false}
        sizeClassName="size-11"
        src={withIconUrlFallback(user.iconUrl)}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate font-bold text-sm">{user.name}</p>
          {user.isFollowee && user.isFollower && (
            <Badge
              variant="secondary"
              className="shrink-0 px-1.5 py-0 font-normal text-[10px]"
            >
              {t("相互", "Mutual")}
            </Badge>
          )}
        </div>
        {user.biography && (
          <p
            className={cn(
              "break-words text-muted-foreground text-xs",
              props.bioClassName,
            )}
          >
            {user.biography}
          </p>
        )}
        {lastPosted && (
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {t("最終投稿", "Last post")} {lastPosted}
          </p>
        )}
      </div>
    </Link>
  )
}

function RelationFollowButton(props: { user: RelationUser; kind: Kind }) {
  return (
    <div className="w-28 shrink-0">
      <FollowButton
        targetUserId={props.user.id}
        targetUserName={props.user.name}
        isFollow={props.user.isFollowee}
        isFollower={props.kind === "followers" || props.user.isFollower}
      />
    </div>
  )
}

function RelationCard(props: { user: RelationUser; kind: Kind }) {
  const t = useTranslation()
  const works = props.user.works ?? []

  return (
    <article className="rounded-xl border border-border bg-card p-3 md:p-4">
      <div className="flex items-start gap-3">
        <RelationIdentity
          user={props.user}
          bioClassName="line-clamp-2"
          showLastPosted={true}
        />
        <RelationFollowButton user={props.user} kind={props.kind} />
      </div>
      {works.length > 0 && (
        <ul className="-mx-3 mt-3 flex snap-x gap-2 overflow-x-auto px-3 md:mx-0 md:grid md:grid-cols-6 md:overflow-visible md:px-0">
          {works.map((work) => (
            <li
              key={work.id}
              className="relative w-24 shrink-0 snap-start md:w-auto"
            >
              <Link to={`/posts/${work.id}`} className="block">
                <img
                  className="aspect-square w-full rounded-md bg-muted object-cover"
                  alt={t.workTitle(work.title, work.enTitle)}
                  src={toResizedImageUrl(work.smallThumbnailImageURL, 240)}
                  loading="lazy"
                  decoding="async"
                  width={240}
                  height={240}
                />
              </Link>
              <div className="absolute right-0 bottom-0">
                <LikeButton
                  size={40}
                  targetWorkId={work.id}
                  targetWorkOwnerUserId={work.user?.id ?? ""}
                  defaultLiked={work.isLiked}
                  defaultLikedCount={0}
                  isBackgroundNone={true}
                  strokeWidth={2}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}

function RelationRow(props: { user: RelationUser; kind: Kind }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-2.5">
      <RelationIdentity
        user={props.user}
        bioClassName="line-clamp-1"
        showLastPosted={false}
      />
      <RelationFollowButton user={props.user} kind={props.kind} />
    </div>
  )
}

function RelationSkeleton(props: { mode: Mode }) {
  if (props.mode === "simple") {
    return (
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 12 }, (_, index) => (
          <Skeleton key={index.toString()} className="h-[68px] rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }, (_, index) => (
        <div
          key={index.toString()}
          className="rounded-xl border border-border p-3 md:p-4"
        >
          <div className="flex items-start gap-3">
            <Skeleton className="size-11 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48 max-w-full" />
            </div>
            <Skeleton className="h-8 w-28 shrink-0 rounded-full" />
          </div>
          <div className="mt-3 flex gap-2 overflow-hidden md:grid md:grid-cols-6">
            {Array.from({ length: 6 }, (_, work) => (
              <Skeleton
                key={work.toString()}
                className="aspect-square w-24 shrink-0 rounded-md md:w-auto"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
