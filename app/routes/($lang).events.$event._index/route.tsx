import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { Link, useLoaderData, useSearchParams } from "@remix-run/react"
import { format } from "date-fns"
import { graphql } from "gql.tada"
import { Share2 } from "lucide-react"
import React, { useContext, useEffect } from "react"
import { toast } from "sonner"
import { SensitiveToggle } from "~/components/sensitive/sensitive-toggle"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip"
import { config, META } from "~/config"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { loaderClient } from "~/lib/loader-client"
import { CopyWorkUrlButton } from "~/routes/($lang)._main.posts.$post._index/components/work-action-copy-url"
import { XIntent } from "~/routes/($lang)._main.posts.$post._index/components/work-action-share-x"
import {
  EventAwardWorkList,
  EventAwardWorkListItemFragment,
} from "~/routes/($lang).events.$event._index/components/event-award-work-list"
import {
  EventWorkList,
  EventWorkListItemFragment,
} from "~/routes/($lang).events.$event._index/components/event-work-list"
import type { SortType } from "~/types/sort-type"
import { createMeta } from "~/utils/create-meta"

type NormalizedEvent = {
  eventSource: "OFFICIAL" | "USER"
  id: string
  slug: string
  title: string
  description: string
  thumbnailImageUrl: string
  headerImageUrl: string
  startAt: number
  endAt: number
  mainTag: string
  tags: string[]
  status: string
  remainingDays: number
  worksCount: number
  participantCount: number
  rankingEnabled: boolean
  rankingType: string
  participationGuide: string
  announcementText: string
  isSensitive: boolean
  userId?: string | null
  userName?: string | null
  works: any[]
  awardWorks: any[]
}

const buildEventAnnouncementText = (props: {
  title: string
  tag: string
  startAt: number
  endAt: number
  slug: string
}) => {
  const startAt = new Date(props.startAt * 1000).toLocaleString("ja-JP")
  const endAt = new Date(props.endAt * 1000).toLocaleString("ja-JP")

  return `${props.title}\n開催期間: ${startAt}〜${endAt}\n参加タグ: #${props.tag}\n詳細: https://www.aipictors.com/events/${props.slug}`
}

const normalizeOfficialEvent = (event: any): NormalizedEvent => ({
  eventSource: "OFFICIAL",
  id: event.id,
  slug: event.slug,
  title: event.title,
  description: event.description,
  thumbnailImageUrl: event.thumbnailImageUrl,
  headerImageUrl: event.headerImageUrl,
  startAt: event.startAt,
  endAt: event.endAt,
  mainTag: event.tag,
  tags: event.tag ? [event.tag] : [],
  status: event.status,
  remainingDays: event.remainingDays,
  worksCount: event.worksCount,
  participantCount: 0,
  rankingEnabled: Boolean(event.awardWorks?.length),
  rankingType: "LIKES",
  participationGuide: event.wayToJoin ?? "",
  announcementText: buildEventAnnouncementText({
    title: event.title,
    tag: event.tag,
    startAt: event.startAt,
    endAt: event.endAt,
    slug: event.slug,
  }),
  isSensitive: false,
  works: event.works ?? [],
  awardWorks: event.awardWorks ?? [],
})

const normalizeUserEvent = (event: any): NormalizedEvent => ({
  eventSource: "USER",
  id: event.id,
  slug: event.slug,
  title: event.title,
  description: event.description,
  thumbnailImageUrl:
    event.thumbnailImageUrl || event.headerImageUrl || "/images/opepnepe.png",
  headerImageUrl:
    event.headerImageUrl || event.thumbnailImageUrl || "/images/opepnepe.png",
  startAt: event.startAt,
  endAt: event.endAt,
  mainTag: event.mainTag,
  tags: event.tags,
  status: event.status,
  remainingDays: event.remainingDays,
  worksCount: event.entryCount,
  participantCount: event.participantCount,
  rankingEnabled: event.rankingEnabled,
  rankingType: event.rankingType ?? "LIKES",
  participationGuide: event.participationGuide ?? "",
  announcementText:
    event.announcementText ||
    buildEventAnnouncementText({
      title: event.title,
      tag: event.mainTag,
      startAt: event.startAt,
      endAt: event.endAt,
      slug: event.slug,
    }),
  isSensitive: event.isSensitive ?? false,
  userId: event.userId,
  userName: event.userName,
  works: event.works ?? [],
  awardWorks: event.awardWorks ?? [],
})

const getStatusBadgeClassName = (status: string) => {
  if (status === "ONGOING") {
    return "border-transparent bg-emerald-500 text-white"
  }

  if (status === "UPCOMING") {
    return "border-transparent bg-sky-500 text-white"
  }

  return "border-transparent bg-slate-500 text-white"
}

function EventStatCard(props: {
  label: string
  value: string
  helper?: string
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/95 px-4 py-4 shadow-sm backdrop-blur">
      <div className="font-medium text-foreground/75 text-xs uppercase tracking-wide">
        {props.label}
      </div>
      <div className="mt-2 font-bold text-2xl text-foreground leading-none md:text-3xl">
        {props.value}
      </div>
      {props.helper && (
        <div className="mt-2 text-foreground/70 text-xs">{props.helper}</div>
      )}
    </div>
  )
}

function EventPeriodCard(props: {
  startAt: number
  endAt: number
  t: ReturnType<typeof useTranslation>
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/95 px-4 py-4 shadow-sm backdrop-blur">
      <div className="font-medium text-foreground/75 text-xs uppercase tracking-wide">
        {props.t("開催期間", "Event period")}
      </div>
      <div className="mt-2 flex items-center gap-2 font-bold text-2xl text-foreground leading-none md:text-3xl">
        <span>{formatEventMonthDayText(props.startAt)}</span>
        <span className="text-foreground/55">→</span>
        <span>{formatEventMonthDayText(props.endAt)}</span>
      </div>
      <div className="mt-2 text-foreground/70 text-xs">
        {props.t("日本時間", "Japan time (JST)")}
      </div>
    </div>
  )
}

function EventHeroContent(props: {
  appEvent: NormalizedEvent
  statusText: string
  statusDescription: string
  t: ReturnType<typeof useTranslation>
  className?: string
  isOverlay?: boolean
}) {
  const eventTypeText =
    props.appEvent.eventSource === "USER"
      ? props.t("ユーザー企画", "User event")
      : props.t("公式イベント", "Official event")

  const heroHighlightText =
    props.appEvent.status === "ONGOING"
      ? props
          .t("⏳ 残り{{count}}日", "⏳ {{count}} days left")
          .replace("{{count}}", props.appEvent.remainingDays.toString())
      : props.appEvent.status === "UPCOMING"
        ? props.t("🗓 開催前", "🗓 Upcoming")
        : props.t("✓ 終了済み", "✓ Ended")

  const subtitleClassName = props.isOverlay
    ? "text-sm text-white/80 md:text-base"
    : "text-sm text-foreground/80 md:text-base"

  return (
    <div className={props.className}>
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          className={`${getStatusBadgeClassName(props.appEvent.status)} ${props.isOverlay ? "backdrop-blur" : ""}`}
        >
          {props.statusText}
        </Badge>
        <Badge className="border-transparent bg-orange-100 font-semibold text-orange-700">
          {heroHighlightText}
        </Badge>
        {props.appEvent.isSensitive && (
          <Badge
            variant="secondary"
            className={
              props.isOverlay
                ? "bg-rose-50/90 text-rose-700 backdrop-blur"
                : "bg-rose-50 text-rose-700"
            }
          >
            R18
          </Badge>
        )}
        <EventActionShare
          slug={props.appEvent.slug}
          title={props.appEvent.title}
          announcementText={props.appEvent.announcementText}
          isOverlay={props.isOverlay}
        />
      </div>

      <div className="max-w-4xl space-y-3 text-foreground">
        <h1 className="text-pretty font-bold text-3xl text-white leading-tight md:text-4xl xl:text-5xl">
          {props.appEvent.title}
        </h1>
        <p className={subtitleClassName}>{eventTypeText}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <EventPeriodCard
          startAt={props.appEvent.startAt}
          endAt={props.appEvent.endAt}
          t={props.t}
        />
        <EventStatCard
          label={props.t("参加作品数", "Entries")}
          value={props.appEvent.worksCount.toString()}
          helper={props.t("作品", "entries")}
        />
        <EventStatCard
          label={props.t("ランキング方式", "Ranking")}
          value={
            props.appEvent.rankingEnabled
              ? props.appEvent.rankingType
              : props.t("なし", "None")
          }
          helper={props.statusDescription}
        />
      </div>
    </div>
  )
}

function EventActionShare(props: {
  slug: string
  title: string
  announcementText: string
  isOverlay?: boolean
}) {
  const t = useTranslation()

  const currentUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/events/${props.slug}`
      : `https://www.aipictors.com/events/${props.slug}`

  return (
    <Popover>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button
                size="icon"
                variant={props.isOverlay ? "secondary" : "outline"}
                className={
                  props.isOverlay
                    ? "bg-background/90 text-foreground backdrop-blur"
                    : undefined
                }
                aria-label={t("イベントを共有", "Share event")}
                title={t("イベントを共有", "Share event")}
              >
                <Share2 className="size-4" />
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t("イベントを共有", "Share event")}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">
              {t("イベントを共有する", "Share event")}
            </h4>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {props.title}
            </p>
          </div>
          <div className="grid gap-2">
            <CopyWorkUrlButton currentUrl={currentUrl} />
            <XIntent
              text={props.announcementText}
              hashtags={["Aipictors"]}
              label={t("Xで告知する", "Announce on X")}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function EventMetaRow(props: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1 rounded-xl border bg-background px-4 py-3">
      <div className="font-medium text-foreground/80 text-xs">
        {props.label}
      </div>
      <div className="text-foreground text-sm leading-relaxed">
        {props.value}
      </div>
    </div>
  )
}

const formatEventDateTimeText = (
  time: number,
  t: ReturnType<typeof useTranslation>,
) => {
  const date = new Date(time * 1000)
  const japanTime = new Date(date.getTime() - 9 * 60 * 60 * 1000)

  return t(
    format(japanTime, "yyyy年MM月dd日 HH時mm分"),
    format(japanTime, "yyyy/MM/dd HH:mm"),
  )
}

const formatEventDateText = (
  time: number,
  t: ReturnType<typeof useTranslation>,
) => {
  const date = new Date(time * 1000)
  const japanTime = new Date(date.getTime() - 9 * 60 * 60 * 1000)

  return t(format(japanTime, "yyyy年MM月dd日"), format(japanTime, "yyyy/MM/dd"))
}

const formatEventMonthDayText = (time: number) => {
  const date = new Date(time * 1000)
  const japanTime = new Date(date.getTime() - 9 * 60 * 60 * 1000)

  return format(japanTime, "MM/dd")
}

const formatEventTimeOnlyText = (
  time: number,
  t: ReturnType<typeof useTranslation>,
) => {
  const date = new Date(time * 1000)
  const japanTime = new Date(date.getTime() - 9 * 60 * 60 * 1000)

  return t(format(japanTime, "HH時mm分"), format(japanTime, "HH:mm"))
}

export async function loader(props: LoaderFunctionArgs) {
  const event = props.params.event

  const urlParams = new URL(props.request.url).searchParams

  const pageParam = urlParams.get("page")

  const page = pageParam ? Number(pageParam) : 0

  if (event === undefined) {
    throw new Response(null, { status: 404 })
  }

  const orderBy = urlParams.get("WorkOrderby")
    ? (urlParams.get("WorkOrderby") as IntrospectionEnum<"WorkOrderBy">)
    : "LIKES_COUNT"

  const sort = urlParams.get("worksOrderDeskAsc")
    ? (urlParams.get("worksOrderDeskAsc") as SortType)
    : "DESC"

  const eventsResp = await loaderClient.query({
    query: eventDetailQuery,
    variables: {
      limit: 64,
      offset: page * 64,
      slug: event,
      where: {
        ratings: ["G", "R15"],
        isNowCreatedAt: true,
        orderBy,
        sort,
      },
      isSensitive: false,
    },
  })

  const appEvent = eventsResp.data.appEvent
  const userEvent = eventsResp.data.userEvent

  if (appEvent === null && userEvent === null) {
    throw new Response(null, { status: 404 })
  }

  return {
    appEvent: appEvent
      ? normalizeOfficialEvent(appEvent)
      : normalizeUserEvent(userEvent),
    page,
  }
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneMinute,
})

export const meta: MetaFunction = ({ data }) => {
  if (!data) {
    return [{ title: "イベントが見つかりませんでした" }]
  }

  const appEvent = (data as { appEvent: NormalizedEvent }).appEvent

  const stripHtmlTags = (str: string) => {
    return str.replace(/<[^>]*>?/gm, "")
  }

  return createMeta(META.EVENTS_INDEX, {
    title: appEvent.title,
    description: stripHtmlTags(appEvent.description),
    url: appEvent.thumbnailImageUrl,
  })
}

export default function EventDetailPage() {
  const t = useTranslation()
  const authContext = useContext(AuthContext)
  const data = useLoaderData<typeof loader>()
  const [searchParams, setSearchParams] = useSearchParams()

  const [workType, setWorkType] =
    React.useState<IntrospectionEnum<"WorkType"> | null>(
      (searchParams.get("workType") as IntrospectionEnum<"WorkType">) || null,
    )

  const [workOrderBy, setWorkOrderBy] = React.useState<
    IntrospectionEnum<"WorkOrderBy">
  >(
    (searchParams.get("WorkOrderby") as IntrospectionEnum<"WorkOrderBy">) ||
      "DATE_CREATED",
  )

  const [worksOrderDeskAsc, setWorksOrderDeskAsc] = React.useState<SortType>(
    (searchParams.get("worksOrderDeskAsc") as SortType) || "DESC",
  )

  const [rating, setRating] =
    React.useState<IntrospectionEnum<"Rating"> | null>(
      (searchParams.get("rating") as IntrospectionEnum<"Rating">) || null,
    )

  useEffect(() => {
    const params = new URLSearchParams()
    params.set("page", String(data.page))
    if (workType) params.set("workType", workType)
    if (rating) params.set("rating", rating)
    params.set("WorkOrderby", workOrderBy)
    params.set("worksOrderDeskAsc", worksOrderDeskAsc)

    setSearchParams(params)
  }, [
    data.page,
    workType,
    rating,
    workOrderBy,
    worksOrderDeskAsc,
    setSearchParams,
  ])

  const onCopyAnnouncement = async () => {
    try {
      await navigator.clipboard.writeText(data.appEvent.announcementText)
      toast(t("告知文をコピーしました", "Announcement text copied"))
    } catch {
      toast(
        t("告知文のコピーに失敗しました", "Failed to copy announcement text"),
      )
    }
  }

  const isOwner =
    authContext.userId !== null &&
    authContext.userId !== undefined &&
    data.appEvent.userId === authContext.userId

  const statusText =
    data.appEvent.status === "ONGOING"
      ? t("開催中", "Ongoing")
      : data.appEvent.status === "UPCOMING"
        ? t("開催予定", "Upcoming")
        : t("終了", "Ended")

  const statusDescription =
    data.appEvent.status === "ONGOING"
      ? t("残り{{count}}日", "{{count}} days left").replace(
          "{{count}}",
          data.appEvent.remainingDays.toString(),
        )
      : data.appEvent.status === "UPCOMING"
        ? t("開催開始前のイベントです", "This event has not started yet")
        : t("終了済みイベントです", "This event has ended")

  return (
    <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6 px-4 pb-8 md:px-6 xl:px-8">
      {data.appEvent.headerImageUrl && (
        <section className="relative overflow-hidden rounded-3xl border bg-card shadow-xs">
          <img
            className="h-[280px] w-full object-cover object-center md:h-[360px] lg:h-[420px] xl:h-[480px]"
            src={data.appEvent.headerImageUrl}
            alt={data.appEvent.title}
          />
          <div className="xl:absolute xl:inset-0 xl:bg-linear-to-t xl:from-black/75 xl:via-black/45 xl:to-black/20" />
          <div className="border-t bg-slate-950 p-4 md:p-5 xl:hidden">
            <EventHeroContent
              appEvent={data.appEvent}
              statusText={statusText}
              statusDescription={statusDescription}
              t={t}
              className="mx-auto flex max-w-5xl flex-col gap-5"
            />
          </div>
          <div className="absolute inset-x-0 bottom-0 hidden p-6 xl:block xl:p-8">
            <EventHeroContent
              appEvent={data.appEvent}
              statusText={statusText}
              statusDescription={statusDescription}
              t={t}
              isOverlay={true}
              className="mx-auto flex max-w-4xl flex-col gap-5"
            />
          </div>
        </section>
      )}

      <section className="space-y-4 rounded-3xl border bg-card/80 p-4 shadow-xs backdrop-blur-sm md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-1">
            <div className="font-medium text-foreground/80 text-sm">
              {t("作品一覧", "Works")}
            </div>
            <h2 className="font-semibold text-2xl md:text-3xl">
              {t("参加作品（{{count}}）", "Entries ({{count}})").replace(
                "{{count}}",
                data.appEvent.worksCount.toString(),
              )}
            </h2>
          </div>
        </div>

        <EventWorkList
          works={data.appEvent.works}
          maxCount={data.appEvent.worksCount}
          page={data.page}
          slug={data.appEvent.slug}
          eventSource={data.appEvent.eventSource}
          sort={worksOrderDeskAsc}
          orderBy={workOrderBy}
          workType={workType}
          rating={rating}
          sumWorksCount={data.appEvent.worksCount}
          setWorkType={setWorkType}
          setRating={setRating}
          setSort={setWorksOrderDeskAsc}
          onClickTitleSortButton={() => {
            setWorkOrderBy("NAME")
            setWorksOrderDeskAsc(worksOrderDeskAsc === "ASC" ? "DESC" : "ASC")
          }}
          onClickLikeSortButton={() => {
            setWorkOrderBy("LIKES_COUNT")
            setWorksOrderDeskAsc(worksOrderDeskAsc === "ASC" ? "DESC" : "ASC")
          }}
          onClickBookmarkSortButton={() => {
            setWorkOrderBy("BOOKMARKS_COUNT")
            setWorksOrderDeskAsc(worksOrderDeskAsc === "ASC" ? "DESC" : "ASC")
          }}
          onClickCommentSortButton={() => {
            setWorkOrderBy("COMMENTS_COUNT")
            setWorksOrderDeskAsc(worksOrderDeskAsc === "ASC" ? "DESC" : "ASC")
          }}
          onClickViewSortButton={() => {
            setWorkOrderBy("VIEWS_COUNT")
            setWorksOrderDeskAsc(worksOrderDeskAsc === "ASC" ? "DESC" : "ASC")
          }}
          onClickAccessTypeSortButton={() => {
            setWorkOrderBy("ACCESS_TYPE")
            setWorksOrderDeskAsc(worksOrderDeskAsc === "ASC" ? "DESC" : "ASC")
          }}
          onClickDateSortButton={() => {
            setWorkOrderBy("DATE_CREATED")
            setWorksOrderDeskAsc(worksOrderDeskAsc === "ASC" ? "DESC" : "ASC")
          }}
          onClickWorkTypeSortButton={() => {
            setWorkOrderBy("WORK_TYPE")
            setWorksOrderDeskAsc(worksOrderDeskAsc === "ASC" ? "DESC" : "ASC")
          }}
          onClickIsPromotionSortButton={() => {
            setWorkOrderBy("IS_PROMOTION")
            setWorksOrderDeskAsc(worksOrderDeskAsc === "ASC" ? "DESC" : "ASC")
          }}
        />
      </section>

      {data.appEvent.rankingEnabled && data.appEvent.awardWorks.length > 0 && (
        <EventAwardWorkList
          works={data.appEvent.awardWorks}
          slug={data.appEvent.slug}
          eventSource={data.appEvent.eventSource}
        />
      )}

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <Card>
            <CardHeader className="space-y-4 pb-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">
                      {data.appEvent.eventSource === "OFFICIAL"
                        ? t("公式イベント", "Official Event")
                        : t("ユーザー企画", "User Event")}
                    </Badge>
                    <Badge
                      className={getStatusBadgeClassName(data.appEvent.status)}
                    >
                      {statusText}
                    </Badge>
                    {data.appEvent.isSensitive && (
                      <Badge
                        variant="secondary"
                        className="bg-rose-50 text-rose-700"
                      >
                        R18
                      </Badge>
                    )}
                  </div>
                  <div>
                    <h2 className="font-semibold text-2xl leading-tight md:text-3xl">
                      {t("イベント概要", "Event overview")}
                    </h2>
                    <p className="mt-3 font-semibold text-foreground text-lg leading-snug md:text-xl">
                      {data.appEvent.title}
                    </p>
                    <p className="mt-2 text-foreground/90 text-sm leading-relaxed md:text-base">
                      {statusDescription}
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {data.appEvent.description && (
                <div
                  className="prose prose-sm dark:prose-invert max-w-none leading-7"
                  // biome-ignore lint/security/noDangerouslySetInnerHtml: trusted event description HTML
                  dangerouslySetInnerHTML={{
                    __html: data.appEvent.description,
                  }}
                />
              )}

              <div className="space-y-3 rounded-xl border bg-muted/20 p-4">
                <div className="font-medium text-sm">
                  {t("参加アクション", "Actions")}
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button asChild size="lg" className="w-full sm:w-auto">
                    <Link
                      to={`/new/image?event=${data.appEvent.slug}&tag=${encodeURIComponent(data.appEvent.mainTag)}`}
                    >
                      {t("このイベントに投稿する", "Post to this event")}
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="secondary"
                    className="w-full sm:w-auto"
                  >
                    <Link
                      to={`/search?q=${encodeURIComponent(data.appEvent.mainTag)}`}
                    >
                      {t("参加タグの作品を見る", "View works with this tag")}
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {data.appEvent.participationGuide && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">
                  {t("参加方法", "How to join")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap text-sm leading-7 md:text-[15px]">
                  {data.appEvent.participationGuide}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="flex flex-col gap-3 pb-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-lg">
                {t("告知用テキスト", "Announcement text")}
              </CardTitle>
              <Button
                variant="secondary"
                className="w-full sm:w-auto"
                onClick={onCopyAnnouncement}
              >
                {t("告知文をコピー", "Copy announcement text")}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border bg-muted/30 p-4 font-mono text-xs leading-6 md:text-sm">
                {data.appEvent.announcementText
                  .split("\n")
                  .map((line, index) => (
                    <div key={`${index}-${line}`}>{line}</div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">
                {t("イベント情報", "Event info")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <EventMetaRow
                label={t("イベント種別", "Event type")}
                value={
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">
                      {data.appEvent.eventSource === "OFFICIAL"
                        ? t("公式イベント", "Official Event")
                        : t("ユーザー企画", "User Event")}
                    </Badge>
                    <Badge
                      className={getStatusBadgeClassName(data.appEvent.status)}
                    >
                      {statusText}
                    </Badge>
                    {data.appEvent.isSensitive && (
                      <Badge
                        variant="secondary"
                        className="bg-rose-50 text-rose-700"
                      >
                        R18
                      </Badge>
                    )}
                  </div>
                }
              />

              {data.appEvent.eventSource === "USER" && data.appEvent.userId && (
                <EventMetaRow
                  label={t("主催者", "Host")}
                  value={
                    <Link
                      className="font-medium underline underline-offset-2"
                      to={`/users/${data.appEvent.userId}`}
                    >
                      {data.appEvent.userName ?? data.appEvent.userId}
                    </Link>
                  }
                />
              )}

              <EventMetaRow
                label={t("開催期間", "Event period")}
                value={
                  <div className="space-y-2">
                    <div className="rounded-lg bg-muted/40 px-3 py-2">
                      <div className="text-muted-foreground text-xs">
                        {t("開始", "Starts")}
                      </div>
                      <div className="font-medium">
                        {formatEventDateTimeText(data.appEvent.startAt, t)}
                      </div>
                    </div>
                    <div className="rounded-lg bg-muted/40 px-3 py-2">
                      <div className="text-muted-foreground text-xs">
                        {t("終了", "Ends")}
                      </div>
                      <div className="font-medium">
                        {formatEventDateTimeText(data.appEvent.endAt, t)}
                      </div>
                    </div>
                  </div>
                }
              />

              <EventMetaRow
                label={t("タグ", "Tags")}
                value={
                  <div className="flex flex-wrap gap-2">
                    {data.appEvent.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="bg-muted text-foreground"
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                }
              />

              {data.appEvent.slug && (
                <EventMetaRow
                  label={t("表示切替", "Display toggle")}
                  value={
                    <SensitiveToggle
                      variant="compact"
                      targetUrl={`/r/events/${data.appEvent.slug}`}
                    />
                  }
                />
              )}
            </CardContent>
          </Card>

          {isOwner && data.appEvent.eventSource === "USER" && (
            <Card className="border-dashed">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">
                  {t("管理", "Management")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground text-sm">
                  {t(
                    "主催者向けの設定変更はこちらから行えます。",
                    "Organizer-only settings are available here.",
                  )}
                </p>
                <Button
                  asChild
                  variant="secondary"
                  className="w-full justify-center"
                >
                  <Link to={`/events/${data.appEvent.slug}/edit`}>
                    {t("イベントを編集", "Edit event")}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </aside>
      </section>
    </div>
  )
}

const eventDetailQuery = graphql(
  `query EventDetail($slug: String!, $offset: Int!, $limit: Int!, $where: WorksWhereInput!, $isSensitive: Boolean!) {
    appEvent(slug: $slug) {
      id
      description
      title
      slug
      thumbnailImageUrl
      headerImageUrl
      startAt
      endAt
      tag
      worksCount
      wayToJoin
      status
      remainingDays
      works(offset: $offset, limit: $limit, where: $where) {
        ...EventWorkListItem
      }
      awardWorks(offset: 0, limit: 20, isSensitive: $isSensitive) {
        ...EventAwardWorkListItem
      }
    }
    userEvent(slug: $slug) {
      id
      title
      slug
      description
      thumbnailImageUrl
      headerImageUrl
      startAt
      endAt
      mainTag
      tags
      status
      remainingDays
      entryCount
      participantCount
      rankingEnabled
      rankingType
      participationGuide
      announcementText
      isSensitive
      userId
      userName
      works(offset: $offset, limit: $limit, where: $where) {
        ...EventWorkListItem
      }
      awardWorks(offset: 0, limit: 20, isSensitive: $isSensitive) {
        ...EventAwardWorkListItem
      }
    }
  }`,
  [EventWorkListItemFragment, EventAwardWorkListItemFragment],
)
