import { useQuery } from "@apollo/client/index"
import { Link } from "@remix-run/react"
import { graphql } from "gql.tada"
import {
  BookmarkIcon,
  BoxIcon,
  CalendarDaysIcon,
  ChevronRightIcon,
  CoinsIcon,
  CrownIcon,
  EyeIcon,
  HeartIcon,
  ImageIcon,
  MessageCircleIcon,
  PenLineIcon,
  PlusIcon,
  SettingsIcon,
  SparklesIcon,
  TrophyIcon,
  UserIcon,
  UsersIcon,
} from "lucide-react"
import { useContext, useEffect, useState } from "react"
import { AmazonExchangeCodesPanel } from "~/components/amazon-exchange-codes-panel"
import { Skeleton } from "~/components/ui/skeleton"
import { AuthContext } from "~/contexts/auth-context"
import { useCoinBalance } from "~/hooks/use-coin-balance"
import { useTranslation } from "~/hooks/use-translation"
import { fetchMyUserModels } from "~/lib/user-models/client"
import type { MyUserModelsResult, UserModel } from "~/lib/user-models/types"
import { cn } from "~/lib/utils"
import { SupportRankingSection } from "~/routes/($lang).settings.points/components/support-ranking-section"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

type MyEventsPreviewQueryData = {
  userEvents: Array<{
    id: string
    slug: string
    title: string
    mainTag: string
    status: string
    startAt: number
    endAt: number
    entryCount: number
    participantCount: number
  }>
}

const PASS_NAMES: Record<string, [string, string]> = {
  LITE: ["ライト", "Lite"],
  STANDARD: ["スタンダード", "Standard"],
  PREMIUM: ["プレミアム", "Premium"],
  TWO_DAYS: ["2日プラン", "2-day pass"],
  FIVE_DAYS: ["5日プラン", "5-day pass"],
}

const formatNumber = (value: number | null | undefined) =>
  (value ?? 0).toLocaleString()

/**
 * 日付（日本時間、YYYY.MM.DD）。サーバーとブラウザで同じ文字にする
 */
const formatDate = (unixSeconds: number) => {
  const date = new Date((unixSeconds + 9 * 60 * 60) * 1000)
  return `${date.getUTCFullYear()}.${String(date.getUTCMonth() + 1).padStart(2, "0")}.${String(date.getUTCDate()).padStart(2, "0")}`
}

/**
 * マイページのホーム
 * - いまの状態（プラン・コイン・モデル枠・フォロワー）を最初に一覧できるようにする
 * - 取得はすべて並行（以前は 1 つずつ待っていた）。届くまでは枠だけ出して、ページ全体は待たせない
 */
export function DashboardHomeContents() {
  const t = useTranslation()
  const auth = useContext(AuthContext)
  const skip = auth.isLoading || auth.isNotLoggedIn || !auth.userId

  const viewer = useQuery(viewerUserQuery, { skip })
  const user = viewer.data?.viewer?.user
  const pass = viewer.data?.viewer?.currentPass

  const latestWorks = useQuery(latestWorksQuery, {
    skip,
    variables: {
      offset: 0,
      limit: 8,
      where: {
        userId: auth.userId ?? "",
        orderBy: "DATE_CREATED",
        sort: "DESC",
      },
    },
  })

  const topWorks = useQuery(topWorksQuery, {
    skip,
    variables: {
      offset: 0,
      limit: 3,
      where: {
        userId: auth.userId ?? "",
        orderBy: "LIKES_COUNT",
        sort: "DESC",
      },
    },
  })

  const myEvents = useQuery<MyEventsPreviewQueryData>(
    // biome-ignore lint/suspicious/noExplicitAny: gql.tada の型が UserEventsWhereInput を持たないため
    myEventsPreviewQuery as any,
    {
      skip,
      variables: {
        offset: 0,
        limit: 3,
        where: { onlyMine: true, sort: "NEWEST" },
      },
    },
  )

  const coins = useCoinBalance()
  const models = useMyUserModels(!skip)

  const planName = pass?.type
    ? t(...(PASS_NAMES[pass.type] ?? [pass.type, pass.type]))
    : t("フリー", "Free")

  return (
    <div className="space-y-8 pb-12">
      {/* プロフィール */}
      <section className="overflow-hidden rounded-2xl border bg-card">
        <div
          className="h-24 bg-gradient-to-r from-sky-400/40 via-violet-400/40 to-pink-400/40 bg-center bg-cover md:h-32"
          style={
            user?.headerImageUrl
              ? { backgroundImage: `url("${user.headerImageUrl}")` }
              : undefined
          }
        />
        <div className="flex flex-col gap-4 px-4 pb-4 md:flex-row md:items-end md:justify-between md:px-6">
          <div className="-mt-10 flex items-end gap-3 md:-mt-12">
            <div className="size-20 shrink-0 overflow-hidden rounded-full border-4 border-card bg-muted md:size-24">
              {user ? (
                <img
                  src={withIconUrlFallback(user.iconUrl)}
                  alt={user.name}
                  className="size-full object-cover"
                  width={96}
                  height={96}
                />
              ) : null}
            </div>
            <div className="min-w-0 pb-1">
              {user ? (
                <>
                  <p className="truncate font-bold text-lg md:text-xl">
                    {user.name}
                  </p>
                  <p className="truncate text-muted-foreground text-sm">
                    @{user.login}
                  </p>
                </>
              ) : (
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-20" />
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <QuickAction to="/new/image" icon={PlusIcon} primary>
              {t("投稿する", "Post")}
            </QuickAction>
            <QuickAction to="/generation" icon={SparklesIcon}>
              {t("生成する", "Generate")}
            </QuickAction>
            {user && (
              <QuickAction to={`/users/${user.login}`} icon={UserIcon}>
                {t("プロフィール", "Profile")}
              </QuickAction>
            )}
            <QuickAction to="/settings/profile" icon={SettingsIcon}>
              {t("設定", "Settings")}
            </QuickAction>
          </div>
        </div>
      </section>

      {/* いまの状態 */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatusCard
          to="/plus"
          icon={CrownIcon}
          label={t("プラン", "Plan")}
          isLoading={viewer.loading}
          value={planName}
          sub={
            pass?.periodEnd
              ? t(
                  `${formatDate(pass.periodEnd)} まで`,
                  `Until ${formatDate(pass.periodEnd)}`,
                )
              : t("プランを見る", "See plans")
          }
        />
        <StatusCard
          to="/settings/points"
          icon={CoinsIcon}
          label={t("コイン", "Coins")}
          isLoading={coins.isLoading}
          value={formatNumber(
            (coins.balance?.freeCoinsBalance ?? 0) +
              (coins.balance?.premiumCoinsBalance ?? 0),
          )}
          sub={t(
            `無料 ${formatNumber(coins.balance?.freeCoinsBalance)}・プレミアム ${formatNumber(coins.balance?.premiumCoinsBalance)}`,
            `Free ${formatNumber(coins.balance?.freeCoinsBalance)} / Premium ${formatNumber(coins.balance?.premiumCoinsBalance)}`,
          )}
        />
        <StatusCard
          to="/settings/models"
          icon={BoxIcon}
          label={t("モデル枠", "Model slots")}
          isLoading={models.isLoading}
          value={
            models.data ? `${models.data.used} / ${models.data.limit}` : "-"
          }
          progress={
            models.data && models.data.limit > 0
              ? models.data.used / models.data.limit
              : undefined
          }
        />
        <StatusCard
          to={user ? `/users/${user.login}` : "/my"}
          icon={UsersIcon}
          label={t("フォロワー", "Followers")}
          isLoading={viewer.loading}
          value={formatNumber(user?.followersCount)}
          sub={t(
            `フォロー ${formatNumber(user?.followCount)}`,
            `Following ${formatNumber(user?.followCount)}`,
          )}
        />
      </section>

      {/* 実績 */}
      <Section title={t("実績", "Stats")}>
        <div className="grid grid-cols-3 gap-px overflow-hidden rounded-2xl border bg-border md:grid-cols-6">
          <StatTile
            icon={ImageIcon}
            label={t("投稿", "Posts")}
            value={user?.worksCount}
            isLoading={viewer.loading}
          />
          <StatTile
            icon={HeartIcon}
            label={t("もらったいいね", "Likes received")}
            value={user?.receivedLikesCount}
            isLoading={viewer.loading}
          />
          <StatTile
            icon={EyeIcon}
            label={t("見られた数", "Views received")}
            value={user?.receivedViewsCount}
            isLoading={viewer.loading}
          />
          <StatTile
            icon={HeartIcon}
            label={t("いいねした", "Liked")}
            value={user?.createdLikesCount}
            isLoading={viewer.loading}
          />
          <StatTile
            icon={BookmarkIcon}
            label={t("ブックマーク", "Bookmarks")}
            value={user?.createdBookmarksCount}
            isLoading={viewer.loading}
          />
          <StatTile
            icon={MessageCircleIcon}
            label={t("コメント", "Comments")}
            value={user?.createdCommentsCount}
            isLoading={viewer.loading}
          />
        </div>
      </Section>

      {/* 作品 */}
      <Section
        title={t("最近の作品", "Recent works")}
        action={{ to: "/my/posts", label: t("すべて管理", "Manage all") }}
      >
        {latestWorks.loading ? (
          <div className="grid grid-cols-4 gap-2 md:grid-cols-8">
            {Array.from({ length: 8 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: 読み込み中の枠
              <Skeleton key={i} className="aspect-square rounded-xl" />
            ))}
          </div>
        ) : (latestWorks.data?.works.length ?? 0) === 0 ? (
          <EmptyState
            text={t("まだ作品がありません", "No works yet")}
            action={{
              to: "/new/image",
              label: t("最初の作品を投稿", "Post your first work"),
            }}
          />
        ) : (
          <div className="grid grid-cols-4 gap-2 md:grid-cols-8">
            {latestWorks.data?.works.map((work) => (
              <Link
                key={work.id}
                to={`/posts/${work.id}`}
                className="group relative aspect-square overflow-hidden rounded-xl bg-muted"
              >
                <img
                  src={work.smallThumbnailImageURL}
                  alt={work.title}
                  className="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-105"
                  width={200}
                  height={200}
                  loading="lazy"
                  decoding="async"
                />
                <span className="absolute right-1 bottom-1 inline-flex items-center gap-0.5 rounded-full bg-black/55 px-1.5 py-0.5 text-[10px] text-white">
                  <HeartIcon className="size-2.5 fill-current" />
                  {formatNumber(work.likesCount)}
                </span>
              </Link>
            ))}
          </div>
        )}

        {(topWorks.data?.works.length ?? 0) > 0 && (
          <div className="mt-4 space-y-2">
            <p className="font-medium text-muted-foreground text-xs">
              {t("いいねが多い作品", "Most liked")}
            </p>
            <ol className="grid gap-2 md:grid-cols-3">
              {topWorks.data?.works.map((work, index) => (
                <li key={work.id}>
                  <Link
                    to={`/posts/${work.id}`}
                    className="flex items-center gap-3 rounded-xl border bg-card p-2 transition-colors hover:bg-muted/50"
                  >
                    <span
                      className={cn(
                        "flex size-6 shrink-0 items-center justify-center rounded-full font-bold text-white text-xs",
                        index === 0
                          ? "bg-amber-400"
                          : index === 1
                            ? "bg-slate-400"
                            : "bg-orange-400",
                      )}
                    >
                      {index + 1}
                    </span>
                    <img
                      src={work.smallThumbnailImageURL}
                      alt={work.title}
                      className="size-11 shrink-0 rounded-lg object-cover"
                      width={44}
                      height={44}
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-sm">
                        {work.title}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {formatNumber(work.likesCount)} {t("いいね", "likes")}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        )}
      </Section>

      {/* 登録したモデル */}
      <Section
        title={t("登録したモデル", "My models")}
        action={{ to: "/settings/models", label: t("管理", "Manage") }}
      >
        {models.isLoading ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: 読み込み中の枠
              <Skeleton key={i} className="h-40 rounded-2xl" />
            ))}
          </div>
        ) : (models.data?.models.length ?? 0) === 0 ? (
          <EmptyState
            text={t(
              "自分のモデルや LoRA を登録すると、生成で使えるようになります",
              "Upload your own models or LoRAs to use them in generation",
            )}
            action={{
              to: "/models/upload",
              label: t("モデルを登録", "Upload a model"),
            }}
          />
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {models.data?.models.slice(0, 8).map((model) => (
              <ModelCard key={model.id} model={model} />
            ))}
            <Link
              to="/models/upload"
              className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed text-muted-foreground text-sm transition-colors hover:bg-muted/50 hover:text-foreground"
            >
              <PlusIcon className="size-5" />
              {t("モデルを登録", "Upload a model")}
            </Link>
          </div>
        )}
      </Section>

      {/* イベント */}
      <Section
        title={t("マイイベント", "My events")}
        action={{ to: "/my/events", label: t("すべて", "All") }}
      >
        {myEvents.loading ? (
          <Skeleton className="h-24 rounded-2xl" />
        ) : (myEvents.data?.userEvents.length ?? 0) === 0 ? (
          <EmptyState
            text={t(
              "まだイベントを作成していません。企画を作るとここで管理できます",
              "You have not created any events yet",
            )}
            action={{
              to: "/events/new",
              label: t("イベントを作成", "Create event"),
            }}
          />
        ) : (
          <div className="grid gap-3 md:grid-cols-3">
            {myEvents.data?.userEvents.map((event) => (
              <Link
                key={event.id}
                to={`/events/${event.slug}`}
                className="space-y-2 rounded-2xl border bg-card p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="line-clamp-2 font-medium text-sm">
                    {event.title}
                  </p>
                  <EventStatus status={event.status} />
                </div>
                <p className="text-muted-foreground text-xs">
                  #{event.mainTag}
                </p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground text-xs">
                  <span className="inline-flex items-center gap-1">
                    <CalendarDaysIcon className="size-3.5" />
                    {formatDate(event.startAt)} - {formatDate(event.endAt)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <TrophyIcon className="size-3.5" />
                    {event.entryCount}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <UsersIcon className="size-3.5" />
                    {event.participantCount}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Section>

      <AmazonExchangeCodesPanel className="space-y-3" maxItems={3} />

      <SupportRankingSection />
    </div>
  )
}

/**
 * 自分が登録したモデル（/api/user-models/mine）
 */
function useMyUserModels(enabled: boolean) {
  const [data, setData] = useState<MyUserModelsResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    setIsLoading(true)
    fetchMyUserModels()
      .then((result) => {
        if (!cancelled) setData(result)
      })
      .catch(() => {
        if (!cancelled) setData(null)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [enabled])

  return { data, isLoading }
}

function Section(props: {
  title: string
  action?: { to: string; label: string }
  children: React.ReactNode
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-bold text-base">{props.title}</h2>
        {props.action && (
          <Link
            to={props.action.to}
            className="inline-flex items-center gap-0.5 text-muted-foreground text-sm transition-colors hover:text-foreground"
          >
            {props.action.label}
            <ChevronRightIcon className="size-4" />
          </Link>
        )}
      </div>
      {props.children}
    </section>
  )
}

function QuickAction(props: {
  to: string
  icon: React.ComponentType<{ className?: string }>
  primary?: boolean
  children: React.ReactNode
}) {
  const Icon = props.icon
  return (
    <Link
      to={props.to}
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-full px-4 font-medium text-sm transition-colors",
        props.primary
          ? "bg-primary text-primary-foreground hover:bg-primary/90"
          : "border bg-background hover:bg-muted",
      )}
    >
      <Icon className="size-4" />
      {props.children}
    </Link>
  )
}

function StatusCard(props: {
  to: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  sub?: string
  progress?: number
  isLoading: boolean
}) {
  const Icon = props.icon
  return (
    <Link
      to={props.to}
      className="group flex flex-col justify-between gap-3 rounded-2xl border bg-card p-4 transition-colors hover:bg-muted/50"
    >
      <div className="flex items-center justify-between text-muted-foreground text-xs">
        <span className="inline-flex items-center gap-1.5">
          <Icon className="size-4" />
          {props.label}
        </span>
        <ChevronRightIcon className="size-4 opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      {props.isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-3 w-28" />
        </div>
      ) : (
        <div className="space-y-1.5">
          <p className="truncate font-bold text-xl tabular-nums">
            {props.value}
          </p>
          {props.progress !== undefined && (
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full",
                  props.progress >= 1 ? "bg-red-500" : "bg-primary",
                )}
                style={{ width: `${Math.min(props.progress, 1) * 100}%` }}
              />
            </div>
          )}
          {props.sub && (
            <p className="truncate text-muted-foreground text-xs">
              {props.sub}
            </p>
          )}
        </div>
      )}
    </Link>
  )
}

function StatTile(props: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number | null | undefined
  isLoading: boolean
}) {
  const Icon = props.icon
  return (
    <div className="flex flex-col gap-1 bg-card p-3 md:p-4">
      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground md:text-xs">
        <Icon className="size-3.5 shrink-0" />
        <span className="truncate">{props.label}</span>
      </span>
      {props.isLoading ? (
        <Skeleton className="h-5 w-12" />
      ) : (
        <span className="font-bold text-base tabular-nums md:text-lg">
          {formatNumber(props.value)}
        </span>
      )}
    </div>
  )
}

const MODEL_STATUS: Record<
  UserModel["status"],
  { ja: string; en: string; className: string }
> = {
  READY: {
    ja: "使えます",
    en: "Ready",
    className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  },
  UPLOADING: {
    ja: "準備中",
    en: "Preparing",
    className: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  },
  DISABLED: {
    ja: "停止中",
    en: "Disabled",
    className: "bg-red-500/15 text-red-600 dark:text-red-400",
  },
  DELETED: {
    ja: "削除済み",
    en: "Deleted",
    className: "bg-muted text-muted-foreground",
  },
}

function ModelCard(props: { model: UserModel }) {
  const t = useTranslation()
  const status = MODEL_STATUS[props.model.status] ?? MODEL_STATUS.READY
  const image = props.model.thumbnailUrl ?? props.model.sampleImageUrls[0]
  return (
    <Link
      to={`/models/u/${props.model.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border bg-card transition-colors hover:bg-muted/50"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {image ? (
          <img
            src={image}
            alt={props.model.name}
            className="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-105"
            width={240}
            height={180}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            <BoxIcon className="size-8" />
          </div>
        )}
        <span
          className={cn(
            "absolute top-2 left-2 rounded-full px-2 py-0.5 font-medium text-[10px] backdrop-blur",
            status.className,
          )}
        >
          {t(status.ja, status.en)}
        </span>
      </div>
      <div className="space-y-1 p-3">
        <p className="truncate font-medium text-sm">{props.model.name}</p>
        <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className="rounded bg-muted px-1.5 py-0.5">
            {props.model.kind === "LORA" ? "LoRA" : "Checkpoint"}
          </span>
          <span className="truncate">{props.model.baseModel}</span>
          <span className="ml-auto inline-flex shrink-0 items-center gap-0.5">
            <PenLineIcon className="size-3" />
            {formatNumber(props.model.useCount)}
          </span>
        </p>
      </div>
    </Link>
  )
}

function EventStatus(props: { status: string }) {
  const t = useTranslation()
  const [label, className] =
    props.status === "ONGOING"
      ? [t("開催中", "Ongoing"), "bg-red-500/15 text-red-600 dark:text-red-400"]
      : props.status === "UPCOMING"
        ? [
            t("開催予定", "Upcoming"),
            "bg-sky-500/15 text-sky-600 dark:text-sky-400",
          ]
        : [t("終了", "Ended"), "bg-muted text-muted-foreground"]
  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2 py-0.5 font-medium text-[10px]",
        className,
      )}
    >
      {label}
    </span>
  )
}

function EmptyState(props: {
  text: string
  action?: { to: string; label: string }
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed px-4 py-8 text-center text-muted-foreground text-sm">
      <p>{props.text}</p>
      {props.action && (
        <Link
          to={props.action.to}
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-4 font-medium text-primary-foreground text-sm transition-colors hover:bg-primary/90"
        >
          <PlusIcon className="size-4" />
          {props.action.label}
        </Link>
      )}
    </div>
  )
}

const viewerUserQuery = graphql(
  `query MyHomeViewer {
    viewer {
      id
      currentPass {
        id
        type
        periodEnd
      }
      user {
        id
        login
        name
        iconUrl
        headerImageUrl
        followersCount
        followCount
        receivedLikesCount
        receivedViewsCount
        createdLikesCount
        createdCommentsCount
        createdBookmarksCount
        worksCount
      }
    }
  }`,
)

export const MyWorkFragment = graphql(
  `fragment MyWork on WorkNode @_unmask {
    id
    title
    smallThumbnailImageURL
    likesCount
  }`,
)

const topWorksQuery = graphql(
  `query MyHomeTopWorks($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...MyWork
    }
  }`,
  [MyWorkFragment],
)

const latestWorksQuery = graphql(
  `query MyHomeLatestWorks($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...MyWork
    }
  }`,
  [MyWorkFragment],
)

const myEventsPreviewQuery = graphql(
  `query MyEventsPreview($offset: Int!, $limit: Int!, $where: UserEventsWhereInput) {
    userEvents(offset: $offset, limit: $limit, where: $where) {
      id
      slug
      title
      mainTag
      status
      startAt
      endAt
      entryCount
      participantCount
    }
  }`,
)
