import { Card, CardContent, CardHeader } from "~/components/ui/card"
import { Link, useLoaderData, useSearchParams } from "@remix-run/react"
import { graphql } from "gql.tada"
import { loaderClient } from "~/lib/loader-client"
import {
  EventWorkList,
  EventWorkListItemFragment,
} from "~/routes/($lang).events.$event._index/components/event-work-list"
import {
  EventAwardWorkList,
  EventAwardWorkListItemFragment,
} from "~/routes/($lang).events.$event._index/components/event-award-work-list"
import { createMeta } from "~/utils/create-meta"
import { config, META } from "~/config"
import { useTranslation } from "~/hooks/use-translation"
import { format } from "date-fns"
import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { SensitiveToggle } from "~/components/sensitive/sensitive-toggle"
import React, { useContext, useEffect } from "react"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import type { SortType } from "~/types/sort-type"
import { Button } from "~/components/ui/button"
import { toast } from "sonner"
import { AuthContext } from "~/contexts/auth-context"

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
  userId: event.userId,
  userName: event.userName,
  works: event.works ?? [],
  awardWorks: event.awardWorks ?? [],
})

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

export default function EventDetailPage () {
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
      toast(t("告知文のコピーに失敗しました", "Failed to copy announcement text"))
    }
  }

  const isOwner =
    authContext.userId !== null &&
    authContext.userId !== undefined &&
    data.appEvent.userId === authContext.userId

  return (
    <div className="flex flex-col space-y-4">
      {data.appEvent.headerImageUrl && (
        <img
          className="max-h-[320px] w-full rounded-xl object-cover"
          src={data.appEvent.headerImageUrl}
          alt=""
        />
      )}
      <div className="flex flex-col gap-x-2 gap-y-2 md:flex-row">
        {data.appEvent.thumbnailImageUrl && (
          <img
            className="h-auto rounded-lg object-cover md:max-w-96"
            src={data.appEvent.thumbnailImageUrl}
            alt=""
          />
        )}
        <Card className="m-auto w-full">
          <CardHeader>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-center">
              <span className="rounded-full bg-black px-3 py-1 text-white text-xs">
                {data.appEvent.eventSource === "OFFICIAL"
                  ? t("公式イベント", "Official Event")
                  : t("ユーザー企画", "User Event")}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-xs text-white ${
                  data.appEvent.status === "ONGOING"
                    ? "bg-red-500"
                    : data.appEvent.status === "UPCOMING"
                      ? "bg-sky-500"
                      : "bg-slate-500"
                }`}
              >
                {data.appEvent.status === "ONGOING"
                  ? t("開催中", "Ongoing")
                  : data.appEvent.status === "UPCOMING"
                    ? t("開催予定", "Upcoming")
                    : t("終了", "Ended")}
              </span>
            </div>
            <div className="mt-2 text-center font-medium text-lg">
              {data.appEvent.title}
            </div>
          </CardHeader>
          <CardContent>
            <div className="m-auto flex flex-col items-center text-left">
              {data.appEvent.description && (
                <div
                  className="mb-2 text-left text-sm"
                  // biome-ignore lint/security/noDangerouslySetInnerHtml: trusted event description HTML
                  dangerouslySetInnerHTML={{ __html: data.appEvent.description }}
                />
              )}
              <div className="mr-auto text-sm">
                {formatEventDateTimeText(data.appEvent.startAt, t)}～
                {formatEventDateTimeText(data.appEvent.endAt, t)}
              </div>
              <div className="mt-2 mr-auto text-sm">
                {data.appEvent.status === "ONGOING"
                  ? t("残り{{count}}日", `{{count}} days left`).replace(
                      "{{count}}",
                      data.appEvent.remainingDays.toString(),
                    )
                  : data.appEvent.status === "UPCOMING"
                    ? t("開催開始前のイベントです", "This event has not started yet")
                    : t("終了済みイベントです", "This event has ended")}
              </div>
              <div className="mt-2 mr-auto text-sm">
                {t("応募作品数:", "Entries:")} {data.appEvent.worksCount}
              </div>
              <div className="mt-2 mr-auto text-sm">
                {t("参加ユーザー数:", "Participants:")} {data.appEvent.participantCount}
              </div>
              <div className="mt-2 mr-auto flex flex-wrap gap-2 text-sm">
                {data.appEvent.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-muted px-2 py-1 text-xs">
                    #{tag}
                  </span>
                ))}
              </div>
              {data.appEvent.eventSource === "USER" && data.appEvent.userId && (
                <div className="mt-3 mr-auto text-sm">
                  {t("主催者:", "Host:")}{" "}
                  <Link className="underline" to={`/users/${data.appEvent.userId}`}>
                    {data.appEvent.userName ?? data.appEvent.userId}
                  </Link>
                </div>
              )}
              <div className="mt-2 mr-auto text-sm">
                {data.appEvent.rankingEnabled
                  ? `${t("ランキング方式:", "Ranking:")} ${data.appEvent.rankingType}`
                  : t("ランキングなしの交流イベントです", "This event does not use ranking")}
              </div>
              {data.appEvent.participationGuide && (
                <div className="mt-4 w-full rounded-lg border bg-muted/30 p-3 text-sm">
                  <div className="mb-1 font-medium">
                    {t("参加方法", "How to join")}
                  </div>
                  <div className="whitespace-pre-wrap">
                    {data.appEvent.participationGuide}
                  </div>
                </div>
              )}
              <div className="mt-4 flex w-full flex-col gap-2 md:flex-row">
                <Button asChild className="flex-1">
                  <Link
                    to={`/new/image?event=${data.appEvent.slug}&tag=${encodeURIComponent(data.appEvent.mainTag)}`}
                  >
                    {t("このイベントに投稿する", "Post to this event")}
                  </Link>
                </Button>
                <Button asChild variant="secondary" className="flex-1">
                  <Link to={`/search?q=${encodeURIComponent(data.appEvent.mainTag)}`}>
                    {t("参加タグの作品を見る", "View works with this tag")}
                  </Link>
                </Button>
                {isOwner && data.appEvent.eventSource === "USER" && (
                  <Button asChild variant="secondary" className="flex-1">
                    <Link to={`/events/${data.appEvent.slug}/edit`}>
                      {t("イベントを編集", "Edit event")}
                    </Link>
                  </Button>
                )}
              </div>
              <div className="mt-4 w-full rounded-lg border bg-background p-3 text-sm">
                <div className="mb-2 font-medium">
                  {t("告知用テキスト", "Announcement text")}
                </div>
                <div className="whitespace-pre-wrap rounded-md bg-muted/40 p-3 text-xs">
                  {data.appEvent.announcementText}
                </div>
                <Button
                  className="mt-3"
                  variant="secondary"
                  onClick={onCopyAnnouncement}
                >
                  {t("告知文をコピー", "Copy announcement text")}
                </Button>
              </div>
              {data.appEvent.slug && (
                <div className="mt-4 mr-auto">
                  <SensitiveToggle
                    variant="compact"
                    targetUrl={`/r/events/${data.appEvent.slug}`}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {data.appEvent.rankingEnabled && data.appEvent.awardWorks.length > 0 && (
        <EventAwardWorkList
          works={data.appEvent.awardWorks}
          slug={data.appEvent.slug}
          eventSource={data.appEvent.eventSource}
        />
      )}

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
