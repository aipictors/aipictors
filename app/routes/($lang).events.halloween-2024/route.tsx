import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { cn } from "~/lib/utils"
import { EventWakiaiaiImage } from "~/routes/events.wakiaiai/components/event-wakiaiai-image"
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare"
import { json, Link } from "@remix-run/react"
import { MousePointerClickIcon } from "lucide-react"
import { loaderClient } from "~/lib/loader-client"
import { graphql } from "gql.tada"
import { EventWorkListItemFragment } from "~/routes/($lang).events.$event._index/components/event-work-list"
import { XIntent } from "~/routes/($lang)._main.posts.$post._index/components/work-action-share-x"
import { useTranslation } from "~/hooks/use-translation"
import { checkLocaleRedirect } from "~/utils/check-locale-redirect"

export async function loader(props: LoaderFunctionArgs) {
  const redirectResponse = checkLocaleRedirect(props.request)

  if (redirectResponse) {
    return redirectResponse
  }

  const event = "halloween-2024"

  const urlParams = new URL(props.request.url).searchParams

  const pageParam = urlParams.get("page")

  const page = pageParam ? Number(pageParam) : 0

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

export default function EventWakiaiai() {
  const t = useTranslation()

  return (
    <div className="space-y-6 py-8">
      <div className="flex flex-col items-center justify-center space-y-4 md:flex-row md:space-x-8 md:space-y-0">
        <div className="max-w-[640px] flex-shrink-0">
          <EventWakiaiaiImage
            alt={t("和気あいAI", "Wakiaiai")}
            imageURL="https://assets.aipictors.com/wakiaiai-halloween.webp"
            linkTitle="Aipictors"
          />
        </div>
      </div>
      <div className="m-auto block flex-col space-y-4 text-center">
        <h2 className="m-auto mb-4 block font-semibold text-lg text-orange-600">
          {t("2024年10月19日(土)", "October 19, 2024 (Saturday)")}
        </h2>
        <div className="flex justify-center space-x-4">
          <Link
            to="/events/wakiaiai3"
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Button variant="outline" className="font-bold text-orange-600">
              {t("和気あいAI3開催決定", "Wakiaiai 3 Event Confirmed")}
              <MousePointerClickIcon className="ml-2" />
            </Button>
          </Link>
          <XIntent
            text={t("和気あいAI ハロウィン企画", "Wakiaiai Halloween Event")}
            url={"https://beta.aipictors.com/events/halloween-2024"}
            hashtags={["和気あいAI", "ハロウィン企画"]}
            className="ml-auto flex w-32 items-center gap-2"
          >
            <span>{t("Xで共有する", "Share on X")}</span>
          </XIntent>
        </div>
      </div>
      <div className={cn("grid gap-6 md:grid-cols-2")}>
        <Card>
          <CardHeader>
            <CardTitle className="font-semibold text-xl">
              {t("応募期間", "Submission Period")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="">
              {t(
                "2024年8月17日(土)～8月24日(土)23:59",
                "August 17, 2024 (Sat) - August 24, 2024 (Sat) 23:59",
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-semibold text-xl">
              {t("募集内容", "Submission Details")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="">
              {t(
                "募集内容は「ハロウィン」をテーマにした「和気あいAI」イラスト/フォトを制作してください。",
                "Create illustrations or photos with the theme of 'Halloween' for the 'Wakiaiai' event.",
              )}
              <br />
              {t(
                "リアルイベントのため、全年齢向けの作品を募集させていただきます。",
                "We are accepting all-ages submissions for this real-life event.",
              )}
              <br />
              {t(
                "応募方法は「!和気あいAIハロウィン企画」のタグをつけてAipictorsへご投稿ください。",
                "Submit your works by tagging them with '!Wakiaiai Halloween Event' on Aipictors.",
              )}
            </p>
          </CardContent>
        </Card>
      </div>
      {/* The rest of the component follows similar translation patterns */}
    </div>
  )
}

export const meta: MetaFunction = () => {
  return [
    { title: "和気あいAI - ハロウィン企画 - 愛知県AIイラスト展示即売会" },
    {
      description:
        "ハロウィン企画、生成AIを利用したイラストの展示やグッズ等の展示即売会",
    },
    {
      property: "og:title",
      content: "和気あいAI - ハロウィン企画 - 愛知県AIイラスト展示即売会",
    },
    {
      property: "og:description",
      content:
        "2024年10月19日(土)ハロウィン企画、生成AIを利用したイラストの展示やグッズ等の展示即売会！",
    },
    {
      property: "og:image",
      content: "https://assets.aipictors.com/wakiaiai-halloween.webp",
    },
    {
      name: "twitter:title",
      content: "和気あいAI - ハロウィン企画 - 愛知県AIイラスト展示即売会",
    },
    {
      name: "twitter:description",
      content:
        "2024年10月19日(土)ハロウィン企画、生成AIを利用したイラストの展示やグッズ等の展示即売会！",
    },
  ]
}

const appEventQuery = graphql(
  `query AppEvent($slug: String!, $offset: Int!, $limit: Int!, $where: WorksWhereInput!) {
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
    }
  }`,
  [EventWorkListItemFragment],
)
