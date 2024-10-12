import { Card, CardHeader, CardContent } from "~/components/ui/card"
import {
  json,
  type MetaFunction,
  type LoaderFunctionArgs,
} from "@remix-run/cloudflare"
import { useLoaderData, useNavigate } from "@remix-run/react"
import { graphql } from "gql.tada"
import { loaderClient } from "~/lib/loader-client"
import {
  EventWorkList,
  EventWorkListItemFragment,
} from "~/routes/($lang).events.$event._index/components/event-work-list"
import { AppConfirmDialog } from "~/components/app/app-confirm-dialog"
import { RefreshCcwIcon } from "lucide-react"
import {
  EventAwardWorkList,
  EventAwardWorkListItemFragment,
} from "~/routes/($lang).events.$event._index/components/event-award-work-list"
import { createMeta } from "~/utils/create-meta"
import { META } from "~/config"
import { useTranslation } from "~/hooks/use-translation"
import { format } from "date-fns"
import { checkLocaleRedirect } from "~/utils/check-locale-redirect"

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

export async function loader(props: LoaderFunctionArgs) {
  const redirectResponse = checkLocaleRedirect(props.request)

  if (redirectResponse) {
    return redirectResponse
  }

  const event = props.params.event

  const urlParams = new URL(props.request.url).searchParams

  const pageParam = urlParams.get("page")

  const page = pageParam ? Number(pageParam) : 0

  if (event === undefined) {
    throw new Response(null, { status: 404 })
  }

  const eventsResp = await loaderClient.query({
    query: appEventQuery,
    variables: {
      limit: 64,
      offset: page * 64,
      slug: event,
      where: {
        ratings: ["G", "R15"],
        isNowCreatedAt: true,
      },
      isSensitive: false,
    },
  })

  if (eventsResp.data.appEvent === null) {
    throw new Response(null, { status: 404 })
  }

  return json({
    appEvent: eventsResp.data.appEvent,
    page,
  })
}

export const meta: MetaFunction = ({ data }) => {
  if (!data) {
    return [{ title: "イベントが見つかりませんでした" }]
  }

  const { appEvent } = data as {
    appEvent: { title: string; description: string; thumbnailImageUrl: string }
  }

  const stripHtmlTags = (str: string) => {
    return str.replace(/<[^>]*>?/gm, "")
  }

  return createMeta(META.EVENTS_INDEX, {
    title: appEvent.title,
    description: stripHtmlTags(appEvent.description),
    url: appEvent.thumbnailImageUrl,
  })
}

export default function FollowingLayout() {
  const t = useTranslation()

  const data = useLoaderData<typeof loader>()

  const navigate = useNavigate()

  if (data === null) {
    return null
  }

  return (
    <div className="flex flex-col space-y-4">
      {data.appEvent.thumbnailImageUrl && (
        <img
          className="h-auto max-h-96 w-full rounded-lg object-cover"
          src={data.appEvent.thumbnailImageUrl}
          alt=""
        />
      )}
      <Card className="m-auto w-full">
        <CardHeader>
          <div className="mt-4 text-center font-medium text-lg">
            {data.appEvent.title}
          </div>
        </CardHeader>
        <CardContent>
          <div className="m-auto flex flex-col items-center text-left">
            {data.appEvent.description && (
              <div
                className="mb-2 text-left text-sm"
                // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
                dangerouslySetInnerHTML={{ __html: data.appEvent.description }}
              />
            )}
            {data.appEvent.startAt && data.appEvent.endAt && (
              <div className="mr-auto text-sm">
                {toEventDateTimeText(data.appEvent.startAt)}～
                {toEventDateTimeText(data.appEvent.endAt)}
              </div>
            )}
            <div className="mt-2 mr-auto text-sm">
              {t("応募作品数:", "Number of Submissions:")}{" "}
              {data.appEvent.worksCount?.toString() ?? "0"}
            </div>
            <div className="mt-2 mr-auto text-sm">
              <span>
                {t("参加タグ:", "Event Tag:")} {data.appEvent.tag}
              </span>
            </div>
            {data.appEvent.slug !== null && (
              <AppConfirmDialog
                title={t("確認", "Confirmation")}
                description={t(
                  "センシティブ版を表示します。あなたは18歳以上ですか？",
                  "Displaying sensitive content. Are you over 18?",
                )}
                onNext={() => {
                  navigate(`/r/events/${data.appEvent.slug}`)
                }}
                cookieKey={"check-sensitive-ranking"}
                onCancel={() => {}}
              >
                <div className="mt-4 flex w-40 cursor-pointer justify-center">
                  <RefreshCcwIcon className="mr-1 w-3" />
                  <p className="text-sm">{t("対象年齢", "Age Restriction")}</p>
                </div>
              </AppConfirmDialog>
            )}
          </div>
        </CardContent>
      </Card>
      {data.appEvent.awardWorks && (
        <EventAwardWorkList
          works={data.appEvent.awardWorks}
          slug={data.appEvent.slug ?? ""}
        />
      )}
      <h2 className="font-bold text-md">{t("作品一覧", "List of Works")}</h2>
      {data.appEvent.works && (
        <EventWorkList
          works={data.appEvent.works}
          maxCount={data.appEvent.worksCount as number}
          page={data.page}
          slug={data.appEvent.slug ?? ""}
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
        ...EventWorkListItem
      }
      awardWorks(offset: 0, limit: 20, isSensitive: $isSensitive) {
        ...EventAwardWorkListItem
      }
    }
  }`,
  [EventAwardWorkListItemFragment, EventWorkListItemFragment],
)
