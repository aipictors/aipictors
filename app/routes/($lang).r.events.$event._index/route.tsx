import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/cloudflare"
import { useLoaderData, useNavigate, useSearchParams } from "@remix-run/react"
import { format } from "date-fns"
import { graphql } from "gql.tada"
import { RefreshCcwIcon } from "lucide-react"
import React, { useEffect } from "react"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader } from "~/components/ui/card"
import { config } from "~/config"
import { useTranslation } from "~/hooks/use-translation"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { loaderClient } from "~/lib/loader-client"
import {
  EventSensitiveWorkList,
  EventSensitiveWorkListItemFragment,
} from "~/routes/($lang).r.events.$event._index/components/event-sensitive-work-list"
import type { SortType } from "~/types/sort-type"

type EventSource = "OFFICIAL" | "USER"

type SensitiveEvent = {
  id: string
  description: string
  title: string
  slug: string
  thumbnailImageUrl: string | null
  headerImageUrl: string | null
  startAt: number
  endAt: number
  tag: string
  worksCount: number
  works: React.ComponentProps<typeof EventSensitiveWorkList>["works"]
  awardWorks: React.ComponentProps<typeof EventSensitiveWorkList>["works"]
  eventSource: EventSource
}

const toEventDateTimeText = (time: number) => {
  const t = useTranslation()

  // UTC時間から日本時間（UTC+9）に変換
  const date = new Date(time * 1000)
  const japanTime = new Date(date.getTime() - 9 * 60 * 60 * 1000)

  return t(
    format(japanTime, "yyyy年MM月dd日 HH時mm分"),
    format(japanTime, "yyyy/MM/dd HH:mm"),
  )
}

const normalizeOfficialEvent = (event: any): SensitiveEvent => ({
  id: event.id,
  description: event.description,
  title: event.title,
  slug: event.slug,
  thumbnailImageUrl: event.thumbnailImageUrl,
  headerImageUrl: event.headerImageUrl,
  startAt: event.startAt,
  endAt: event.endAt,
  tag: event.tag,
  worksCount: event.worksCount ?? 0,
  works: event.works ?? [],
  awardWorks: event.awardWorks ?? [],
  eventSource: "OFFICIAL",
})

const normalizeUserEvent = (event: any): SensitiveEvent => ({
  id: event.id,
  description: event.description,
  title: event.title,
  slug: event.slug,
  thumbnailImageUrl: event.thumbnailImageUrl,
  headerImageUrl: event.headerImageUrl,
  startAt: event.startAt,
  endAt: event.endAt,
  tag: event.mainTag,
  worksCount: event.entryCount ?? event.worksCount ?? 0,
  works: event.works ?? [],
  awardWorks: event.awardWorks ?? [],
  eventSource: "USER",
})

export async function loader(props: LoaderFunctionArgs) {
  const event = props.params.event

  const urlParams = new URLSearchParams(props.request.url.split("?")[1])
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
    query: appEventQuery,
    variables: {
      limit: 64,
      offset: page * 64,
      slug: event,
      where: {
        ratings: ["R18", "R18G"],
        isNowCreatedAt: true,
        orderBy: orderBy,
        sort: sort,
      },
      isSensitive: true,
    },
  })

  const normalizedEvent = eventsResp.data.appEvent
    ? normalizeOfficialEvent(eventsResp.data.appEvent)
    : eventsResp.data.userEvent
      ? normalizeUserEvent(eventsResp.data.userEvent)
      : null

  if (normalizedEvent === null) {
    throw new Response(null, { status: 404 })
  }

  return {
    event: normalizedEvent,
    page,
  }
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneHour,
})

export default function FollowingLayout() {
  const data = useLoaderData<typeof loader>()

  const navigate = useNavigate()

  const [searchParams, setSearchParams] = useSearchParams()

  const [workType, setWorkType] =
    React.useState<IntrospectionEnum<"WorkType"> | null>(
      (searchParams.get("workType") as IntrospectionEnum<"WorkType">) || null,
    )

  const [WorkOrderby, setWorkOrderby] = React.useState<
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
    params.set("WorkOrderby", WorkOrderby)
    params.set("worksOrderDeskAsc", worksOrderDeskAsc)

    setSearchParams(params)
  }, [
    data.page,
    workType,
    rating,
    WorkOrderby,
    worksOrderDeskAsc,
    setSearchParams,
  ])

  const onClickTitleSortButton = () => {
    setWorkOrderby("NAME")
    setWorksOrderDeskAsc(worksOrderDeskAsc === "ASC" ? "DESC" : "ASC")
  }

  const onClickLikeSortButton = () => {
    setWorkOrderby("LIKES_COUNT")
    setWorksOrderDeskAsc(worksOrderDeskAsc === "ASC" ? "DESC" : "ASC")
  }

  const onClickBookmarkSortButton = () => {
    setWorkOrderby("BOOKMARKS_COUNT")
    setWorksOrderDeskAsc(worksOrderDeskAsc === "ASC" ? "DESC" : "ASC")
  }

  const onClickCommentSortButton = () => {
    setWorkOrderby("COMMENTS_COUNT")
    setWorksOrderDeskAsc(worksOrderDeskAsc === "ASC" ? "DESC" : "ASC")
  }

  const onClickViewSortButton = () => {
    setWorkOrderby("VIEWS_COUNT")
    setWorksOrderDeskAsc(worksOrderDeskAsc === "ASC" ? "DESC" : "ASC")
  }

  const onClickAccessTypeSortButton = () => {
    setWorkOrderby("ACCESS_TYPE")
    setWorksOrderDeskAsc(worksOrderDeskAsc === "ASC" ? "DESC" : "ASC")
  }

  const onClickDateSortButton = () => {
    setWorkOrderby("DATE_CREATED")
    setWorksOrderDeskAsc(worksOrderDeskAsc === "ASC" ? "DESC" : "ASC")
  }

  const onClickWorkTypeSortButton = () => {
    setWorkOrderby("WORK_TYPE")
    setWorksOrderDeskAsc(worksOrderDeskAsc === "ASC" ? "DESC" : "ASC")
  }

  const onClickIsPromotionSortButton = () => {
    setWorkOrderby("IS_PROMOTION")
    setWorksOrderDeskAsc(worksOrderDeskAsc === "ASC" ? "DESC" : "ASC")
  }

  const [worksMaxCount, _setWorksMaxCount] = React.useState(0)

  return (
    <div className="flex flex-col space-y-4">
      {data.event.thumbnailImageUrl && (
        <img
          className="h-auto max-h-96 w-full rounded-lg object-cover"
          src={data.event.thumbnailImageUrl}
          alt=""
        />
      )}
      <Card className="m-auto w-full">
        <CardHeader>
          <div className="mt-4 text-center font-medium text-lg">
            {data.event.title}
          </div>
        </CardHeader>
        <CardContent>
          <div className="m-auto flex max-w-96 flex-col items-center text-left">
            <div
              className="mb-2 text-left text-sm"
              // biome-ignore lint/security/noDangerouslySetInnerHtml: HTML is generated from serialized/trusted data
              dangerouslySetInnerHTML={{ __html: data.event.description }}
            />
            <div className="mr-auto text-sm">
              {toEventDateTimeText(data.event.startAt)}～
              {toEventDateTimeText(data.event.endAt)}
            </div>
            <div className="mt-2 mr-auto text-sm">
              応募作品数: {data.event.worksCount?.toString() ?? "0"}
            </div>
            <div className="mt-2 mr-auto text-sm">
              <span>参加タグ: {data.event.tag}</span>
            </div>
            <Button
              className="mt-4 flex w-40 cursor-pointer justify-center"
              variant={"secondary"}
              onClick={() => {
                navigate(`/events/${data.event.slug}`)
              }}
            >
              <RefreshCcwIcon className="mr-1 w-3" />
              <p className="text-sm">{"全年齢"}</p>
            </Button>
          </div>
        </CardContent>
      </Card>
      {data.event.slug && (
        <EventSensitiveWorkList
          works={data.event.works}
          maxCount={data.event.worksCount}
          page={data.page}
          slug={data.event.slug}
          eventSource={data.event.eventSource}
          sort={worksOrderDeskAsc}
          orderBy={WorkOrderby}
          sumWorksCount={worksMaxCount}
          workType={workType}
          rating={rating}
          onClickTitleSortButton={onClickTitleSortButton}
          onClickLikeSortButton={onClickLikeSortButton}
          onClickBookmarkSortButton={onClickBookmarkSortButton}
          onClickCommentSortButton={onClickCommentSortButton}
          onClickViewSortButton={onClickViewSortButton}
          onClickAccessTypeSortButton={onClickAccessTypeSortButton}
          onClickDateSortButton={onClickDateSortButton}
          onClickWorkTypeSortButton={onClickWorkTypeSortButton}
          onClickIsPromotionSortButton={onClickIsPromotionSortButton}
          setWorkType={setWorkType}
          setRating={setRating}
          setSort={setWorksOrderDeskAsc}
        />
      )}
    </div>
  )
}

const appEventQuery = graphql(
  `query AppEvent($slug: String!, $offset: Int!, $limit: Int!, $where: WorksWhereInput!, $isSensitive: Boolean!) {
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
      works(offset: $offset, limit: $limit, where: $where) {
        ...EventSensitiveWorkListItem
      }
      awardWorks(offset: 0, limit: 20, isSensitive: $isSensitive) {
        ...EventSensitiveWorkListItem
      }
    }
    userEvent(slug: $slug) {
      id
      description
      title
      slug
      thumbnailImageUrl
      headerImageUrl
      startAt
      endAt
      mainTag
      entryCount
      worksCount
      works(offset: $offset, limit: $limit, where: $where) {
        ...EventSensitiveWorkListItem
      }
      awardWorks(offset: 0, limit: 20, isSensitive: $isSensitive) {
        ...EventSensitiveWorkListItem
      }
    }
  }`,
  [EventSensitiveWorkListItemFragment],
)
