import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { cn } from "~/lib/cn"
import { eventUsers } from "~/routes/events.wakiaiai/assets/event-users"
import { EventWakiaiaiImage } from "~/routes/events.wakiaiai/components/event-wakiaiai-image"
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare"
import { json, Link, useLoaderData } from "@remix-run/react"
import { MousePointerClickIcon } from "lucide-react"
import { createClient } from "~/lib/client"
import { graphql } from "gql.tada"
import {
  EventWorkList,
  EventWorkListItemFragment,
} from "~/routes/($lang).events.$event._index/components/event-work-list"
import { XIntent } from "~/routes/($lang)._main.posts.$post._index/components/work-action-share-x"

export async function loader(props: LoaderFunctionArgs) {
  const event = "halloween-2024"
  const urlParams = new URL(props.request.url).searchParams
  const pageParam = urlParams.get("page")
  const page = pageParam ? Number(pageParam) : 0

  const client = createClient()

  const eventsResp = await client.query({
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
  const length = Math.floor(eventUsers.length / 3)

  const data = useLoaderData<typeof loader>()

  return (
    <div className="space-y-6 py-8">
      <div className="flex flex-col items-center justify-center space-y-4 md:flex-row md:space-x-8 md:space-y-0">
        <div className="max-w-[640px] flex-shrink-0">
          <EventWakiaiaiImage
            alt="和気あいAI"
            imageURL="https://assets.aipictors.com/wakiaiai-halloween.webp"
            linkTitle="Aipictors"
          />
        </div>
      </div>
      <div className="m-auto block flex-col space-y-4 text-center">
        <h2 className="m-auto mb-4 block font-semibold text-lg text-orange-600">
          2024年10月19日(土)
        </h2>
        <div className="flex justify-center space-x-4">
          <Link
            to="/events/wakiaiai3"
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Button variant="outline" className="font-bold text-orange-600">
              和気あいAI3開催決定
              <MousePointerClickIcon className="ml-2" />
            </Button>
          </Link>
          <XIntent
            text={"和気あいAI ハロウィン企画"}
            url={"https://beta.aipictors.com/events/halloween-2024"}
            hashtags={["和気あいAI", "ハロウィン企画"]}
            className="ml-auto flex w-32 items-center gap-2"
          >
            <span>{"Xで共有する"}</span>
          </XIntent>
        </div>
      </div>
      <div className={cn("grid gap-6 md:grid-cols-2")}>
        <Card>
          <CardHeader>
            <CardTitle className="font-semibold text-xl">応募期間</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="">2024年8月17日(土)～8月24日(土)23:59</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-semibold text-xl">募集内容</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="">
              募集内容は「ハロウィン」をテーマにした「和気あいAI」イラスト/フォトを制作してください。
              <br />
              リアルイベントのため、全年齢向けの作品を募集させていただきます。レーティング基準については、Aipictorsの規約内のレーティング基準に準拠してください。
              <br />
              応募方法は「!和気あいAIハロウィン企画」のタグをつけてAipictorsへご投稿ください。
            </p>
          </CardContent>
        </Card>
      </div>
      <div className={cn("grid gap-6 md:grid-cols-2")}>
        <Card>
          <CardHeader>
            <CardTitle className="font-semibold text-xl">応募条件</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="">投稿作品のファイル形式：投稿画面に準拠する。</p>
            <p className="font-bold">
              サイズは<span className="text-xl"> 正方形 </span>
              でお願いいたします、正方形以外は運営側でトリミングか、トリミングが難しい場合は当日の掲載からは省かせていただきます。
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-semibold text-xl">
              ポスター企画！
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="">
              ご応募いただいた作品はイベントポスターとして展示されます。
              ポスターは、841mm x 1189mmのA0サイズで作成されます。
              掲載を辞退される方は、投稿時もしくはAipictorsへDMもしくはメールにてお知らせください。
              ポスターは各サイトで制作される予定です。
            </p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="font-semibold text-xl">
            3サイト合同書籍化企画！
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="">
            人気作品を書籍化して当日物販させていただきます。本イベントは
            <a href="https://ourt-ai.work/">アワートAI</a>様、
            <a href="https://iromirai.jp/">イロミライ</a>
            様との合同企画で3サイト人気作品を10作品ずつ選出してAipictors側で冊子にまとめさせていただきます。
            選出した際には個別にクリエイター様にご連絡させていただきます。
            画像生成モデルなどについてライセンス上、書籍化に関して問題がある場合はご遠慮いただく場合がございますのでご注意下さい。
            <a href="/generation">Aipictorsの生成機</a>
            で生成した場合は特に何も考慮せず問題ございません。
            掲載を辞退される方は、投稿時もしくはAipictorsへDMもしくはメールにてお知らせください。
          </p>
        </CardContent>
      </Card>
      <div className="mb-8 space-y-4 rounded-md bg-zinc-200 p-8 text-left dark:bg-zinc-800 ">
        <h1 className="font-bold text-4xl">和気あいAI</h1>
        <h2 className="font-semibold text-lg ">
          愛知県で10月に開催する生成AIのリアルイベント「和気あいAI」様とのコラボ企画をAipictorsで開催。
        </h2>
        <h3 className="font-semibold text-lg ">
          「ハロウィン」をテーマにした作品を大募集！8月17日(土)～8月24日(土)
        </h3>
        <h3 className="font-semibold text-lg ">
          リアルイベントは、現地にて2024年10月19日(土)に開催！
        </h3>
      </div>
      <div className="md:flex md:space-x-4">
        <img
          src="https://assets.aipictors.com/halloween-wakiaiai-image.webp"
          className="m-auto w-full max-w-[1200px] rounded-lg md:w-1/2"
          alt="和気あいAI"
        />
        <iframe
          className="mt-4 rounded-lg md:mt-0"
          style={{ border: 0 }}
          width="100%"
          src="https://www.youtube.com/embed/_VCTJxdKs3w"
          title="和気あいAI、会場紹介動画"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      {data.appEvent.works && (
        <>
          <h2 className="font-bold text-md">{"作品一覧"}</h2>
          {data.appEvent.works.length === 0 && (
            <p className="text-center">まだ投稿はありません。</p>
          )}

          <EventWorkList
            works={data.appEvent.works}
            isSensitive={false}
            maxCount={data.appEvent.worksCount as number}
            page={data.page}
            slug={data.appEvent.slug ?? ""}
          />
        </>
      )}
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
