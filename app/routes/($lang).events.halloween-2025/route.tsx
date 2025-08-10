import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { EventWakiaiaiImage } from "~/routes/events.wakiaiai/components/event-wakiaiai-image"
import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { Link, useLoaderData } from "@remix-run/react"
import {
  CalendarIcon,
  MapPinIcon,
  UsersIcon,
  PaletteIcon,
  ExternalLinkIcon,
  ImageIcon,
  StoreIcon,
  BadgeIcon,
  ClockIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "lucide-react"
import { loaderClient } from "~/lib/loader-client"
import { graphql } from "gql.tada"
import {
  EventWorkListItemFragment,
  EventWorkList,
} from "~/routes/($lang).events.$event._index/components/event-work-list"
import { config } from "~/config"
import { useState, useId } from "react"

export async function loader(props: LoaderFunctionArgs) {
  const event = "halloween-2025"

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
    // ハロウィン2025イベントが見つからない場合でも表示する
    return {
      appEvent: null,
      page,
    }
  }

  return {
    appEvent: eventsResp.data.appEvent,
    page,
  }
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneMonth,
})

export default function EventHalloween2025() {
  const data = useLoaderData<typeof loader>()
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const participationMethodsId = useId()

  const eventInfo = {
    title: "ハロウィン2025企画",
    subtitle:
      "Aipictorsサイト内企画：和気あいAI4会場での展示・冊子掲載を目指してハロウィン作品を投稿しよう！",
    date: "2025年10月25日(土)",
    time: "10:00〜16:00",
    location: "名古屋鉄道 太田川駅前 大屋根広場",
    address: "愛知県東海市大田町下浜田137",
    access: "太田川駅から徒歩1分",
    admission: "無料",
    deadline: "作品投稿期間：2025年7月21日〜8月31日",
    tag: "!和気あいAI2025ハロウィン企画",
  }

  const features = [
    {
      icon: <PaletteIcon className="h-6 w-6" />,
      title: "Aipictorsサイト内企画",
      description:
        "当企画はAipictorsサイト内での作品投稿企画です。優秀作品がリアルイベントで展示されます",
    },
    {
      icon: <ImageIcon className="h-6 w-6" />,
      title: "和気あいAI4会場での展示",
      description:
        "投稿作品の中から優秀作品が愛知県の実際のイベント会場で展示されます",
    },
    {
      icon: <UsersIcon className="h-6 w-6" />,
      title: "冊子掲載のチャンス",
      description:
        "Aipictors運営が作成する冊子への掲載機会があり、イベント会場で配布・販売されます",
    },
  ]

  const participationMethods = [
    {
      title: "オンライン投稿",
      description:
        "Aipictorsに「!和気あいAI2025ハロウィン企画」タグ付きでハロウィン作品を投稿してください。優秀作品が和気あいAI4会場で展示されます。",
      icon: <BadgeIcon className="h-6 w-6" />,
      link: `/new/image?event=wakiaiai4-halloween&tag=${encodeURIComponent(eventInfo.tag)}`,
    },
    {
      title: "リアル出展（別申込）",
      description:
        "和気あいAI4イベントにクリエイターとして直接出展したい場合は、別途和気あいAI4の出展申込が必要です。",
      icon: <StoreIcon className="h-6 w-6" />,
      link: "/events/wakiaiai4",
    },
  ]

  const faqItems = [
    {
      question: "この企画は何ですか？",
      answer:
        "Aipictorsが主催するサイト内作品投稿企画です。投稿された作品の中から優秀作品を選定し、愛知県で開催されるリアルイベント「和気あいAI4」の会場で展示・冊子掲載を行います。",
    },
    {
      question: "誰が作品を選定・展示するのですか？",
      answer:
        "Aipictors運営が作品を選定し、和気あいAI4イベントにAipictorsとして出展する際の展示内容・冊子収録作品として使用させていただきます。",
    },
    {
      question: "参加方法を教えてください",
      answer: `Aipictorsサイトにハロウィン作品を投稿する際、必ず「${eventInfo.tag}」タグを付けてください。この企画への参加はサイト内投稿のみとなります。`,
    },
    {
      question: "直接イベント会場に出展したい場合は？",
      answer:
        "クリエイター個人として和気あいAI4に出展したい場合は、この企画とは別に和気あいAI4の出展申込が必要です。詳細は和気あいAI4メインページをご確認ください。",
    },
    {
      question: "どんなハロウィン作品を作れば良いですか？",
      answer:
        "ハロウィンをテーマにした生成AI作品であれば何でもOKです。かわいいキャラクター、ホラー風景、仮装シーンなど自由に創作してください。",
    },
  ]

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="mx-auto max-w-4xl">
            <Badge
              variant="secondary"
              className="mb-6 bg-yellow-400 px-6 py-2 font-bold text-black"
            >
              {eventInfo.deadline}
            </Badge>

            <h1 className="mb-4 font-bold text-4xl drop-shadow-lg sm:text-5xl lg:text-6xl">
              🎃 {eventInfo.title}
            </h1>
            <p className="mb-8 text-lg opacity-90 drop-shadow-lg sm:text-xl">
              {eventInfo.subtitle}
            </p>
            <div className="mb-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                <span className="font-semibold">{eventInfo.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <ClockIcon className="h-5 w-5" />
                <span>{eventInfo.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPinIcon className="h-5 w-5" />
                <span>{eventInfo.location}</span>
              </div>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                className="transform border-2 border-orange-300 bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-4 font-bold text-lg text-white shadow-xl transition-all duration-200 hover:scale-105 hover:from-orange-600 hover:to-orange-700"
                onClick={() => {
                  document
                    .getElementById(participationMethodsId)
                    ?.scrollIntoView({ behavior: "smooth" })
                }}
              >
                🎯 参加方法を見る
              </Button>
              <Link to="/events/wakiaiai4">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white bg-black px-8 py-4 font-bold text-lg backdrop-blur-sm hover:bg-white/20"
                >
                  <ExternalLinkIcon className="mr-2 h-5 w-5" />
                  和気あいAI4メインページ
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto space-y-12 px-4 py-12">
        {/* 企画概要セクション */}
        <section>
          <h2 className="mb-8 text-center font-bold text-2xl">企画概要</h2>
          <Card className="border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-purple-50">
            <CardContent className="p-8">
              <div className="space-y-6 text-center">
                <h3 className="font-bold text-orange-700 text-xl">
                  これは何の企画ですか？
                </h3>
                <div className="mx-auto max-w-4xl space-y-4 text-left">
                  <p className="text-lg">
                    この企画は
                    <strong>Aipictorsが主催するサイト内作品投稿企画</strong>
                    です。
                  </p>
                  <p>
                    投稿されたハロウィン作品の中から、Aipictors運営が優秀作品を選定し、
                    愛知県で開催される生成AIイベント「和気あいAI4」において
                    <strong>
                      Aipictorsとして出展する際の展示作品・冊子収録作品
                    </strong>
                    として使用させていただきます。
                  </p>
                  <div className="rounded-lg border border-orange-200 bg-white/70 p-4">
                    <h4 className="mb-2 font-semibold text-orange-800">
                      参加の流れ
                    </h4>
                    <ol className="list-inside list-decimal space-y-1 text-sm">
                      <li>Aipictorsにハロウィン作品を指定タグ付きで投稿</li>
                      <li>Aipictors運営が優秀作品を選定</li>
                      <li>
                        選定作品が和気あいAI4会場でAipictorsブースに展示・冊子掲載
                      </li>
                    </ol>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Main Event Banner */}
        <section className="text-center">
          <div className="mx-auto max-w-3xl">
            <EventWakiaiaiImage
              alt="ハロウィン2025企画"
              imageURL="https://assets.aipictors.com/cc52625d-887c-46f4-afbc-757b7655797f.webp"
              linkTitle="Aipictors"
            />
          </div>
        </section>

        {/* Features */}
        <section>
          <h2 className="mb-8 text-center font-bold text-2xl">企画の特徴</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature, index) => (
              <Card key={index.toString()} className="text-center">
                <CardHeader>
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Event Details */}
        <section>
          <h2 className="mb-8 text-center font-bold text-2xl">
            展示予定会場（和気あいAI4）
          </h2>
          <Card className="border-2 border-blue-200">
            <CardHeader className="bg-blue-50">
              <CardTitle className="text-center text-blue-800">
                選定作品の展示会場について
              </CardTitle>
              <p className="mt-2 text-center text-blue-600 text-sm">
                この企画で投稿された作品の優秀作品は、以下の会場でAipictorsとして展示される予定です
              </p>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-semibold">開催日時</div>
                      <div className="text-muted-foreground">
                        {eventInfo.date} {eventInfo.time}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPinIcon className="mt-1 h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-semibold">開催場所</div>
                      <div className="text-muted-foreground">
                        {eventInfo.location}
                        <br />
                        {eventInfo.address}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <ClockIcon className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-semibold">アクセス</div>
                      <div className="text-muted-foreground">
                        {eventInfo.access}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <UsersIcon className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-semibold">入場料</div>
                      <div className="font-semibold text-muted-foreground">
                        {eventInfo.admission}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Participation Methods */}
        <section id={participationMethodsId}>
          <h2 className="mb-8 text-center font-bold text-2xl">
            企画への参加方法
          </h2>
          <div className="mb-6">
            <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
              <CardContent className="p-6">
                <div className="text-center">
                  <h3 className="mb-2 font-bold text-lg">
                    Aipictors投稿時の必須タグ
                  </h3>
                  <Badge className="bg-orange-600 px-4 py-2 font-mono text-lg text-white">
                    {eventInfo.tag}
                  </Badge>
                  <p className="mt-2 text-muted-foreground text-sm">
                    この企画に参加するには、Aipictorsに作品投稿時にこのタグを必ず付けてください
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {participationMethods.map((method, index) => (
              <Card key={index.toString()}>
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    {method.icon}
                  </div>
                  <CardTitle className="text-lg">{method.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{method.description}</p>
                  <Link
                    to={method.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="w-full">
                      <ExternalLinkIcon className="mr-2 h-4 w-4" />
                      {method.title === "オンライン投稿"
                        ? "作品を投稿する"
                        : "申し込む"}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Works List */}
        {data.appEvent?.works && (
          <section>
            <div className="mb-8 text-center">
              <h2 className="mb-4 font-bold text-2xl">投稿作品</h2>
              <div className="mx-auto mb-6 max-w-2xl rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-950/20">
                <Link
                  to={`/tags/${encodeURIComponent(eventInfo.tag)}`}
                  className="inline-block"
                >
                  <Button
                    variant="default"
                    size="lg"
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    <BadgeIcon className="mr-2 h-4 w-4" />
                    {eventInfo.tag} のタグページで全作品を見る
                  </Button>
                </Link>
              </div>
            </div>
            <EventWorkList
              works={data.appEvent.works}
              maxCount={data.appEvent.worksCount}
              page={data.page}
              slug="halloween-2025"
              sort="DESC"
              orderBy="DATE_CREATED"
              workType={null}
              rating={null}
              sumWorksCount={data.appEvent.worksCount}
              setWorkType={() => {}}
              setRating={() => {}}
              setSort={() => {}}
              isHideSortableSetting={true}
              onClickTitleSortButton={() => {}}
              onClickLikeSortButton={() => {}}
              onClickBookmarkSortButton={() => {}}
              onClickCommentSortButton={() => {}}
              onClickViewSortButton={() => {}}
              onClickAccessTypeSortButton={() => {}}
              onClickDateSortButton={() => {}}
              onClickWorkTypeSortButton={() => {}}
              onClickIsPromotionSortButton={() => {}}
            />
          </section>
        )}

        {/* FAQ */}
        <section>
          <h2 className="mb-8 text-center font-bold text-2xl">よくある質問</h2>
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <Card key={index.toString()}>
                <CardHeader
                  className="cursor-pointer"
                  onClick={() => toggleFaq(index)}
                >
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{item.question}</CardTitle>
                    {expandedFaq === index ? (
                      <ChevronUpIcon className="h-5 w-5" />
                    ) : (
                      <ChevronDownIcon className="h-5 w-5" />
                    )}
                  </div>
                </CardHeader>
                {expandedFaq === index && (
                  <CardContent className="pt-0">
                    <p className="text-muted-foreground">{item.answer}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center">
          <Card className="bg-gradient-to-r from-orange-50 to-purple-50 dark:from-orange-950/20 dark:to-purple-950/20">
            <CardContent className="p-8">
              <h3 className="mb-4 font-bold text-2xl">
                和気あいAI4で会いましょう！
              </h3>
              <p className="mb-6 text-muted-foreground">
                ハロウィン企画と合わせて、メインイベントにもぜひご参加ください
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Link to="/events/wakiaiai4">
                  <Button size="lg" className="px-8 py-4">
                    <ExternalLinkIcon className="mr-2 h-5 w-5" />
                    和気あいAI4詳細を見る
                  </Button>
                </Link>
                <Link
                  to={`/new/image?event=wakiaiai4-halloween&tag=${encodeURIComponent(eventInfo.tag)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="lg" variant="outline" className="px-8 py-4">
                    <PaletteIcon className="mr-2 h-5 w-5" />
                    今すぐ作品投稿
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
{
  /* Main Event Banner */
}
;<div className="text-center">
  <div className="mx-auto max-w-3xl">
    <EventWakiaiaiImage
      alt="ハロウィン2025企画"
      imageURL="https://assets.aipictors.com/cc52625d-887c-46f4-afbc-757b7655797f.webp"
      linkTitle="Aipictors"
    />
  </div>
</div>

{
  /* Event Details */
}
;<div className="grid gap-8 md:grid-cols-2">
  <Card className="border-2 border-orange-300 bg-gradient-to-br from-orange-100 to-yellow-100 shadow-xl dark:from-orange-900/30 dark:to-yellow-900/30">
    <CardHeader className="text-center">
      <CardTitle className="font-bold text-2xl text-orange-600 dark:text-orange-400">
        <CalendarIcon className="mr-2 inline h-6 w-6" />
        開催期間
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4 text-center">
      <p className="font-semibold text-lg">2025年7月21日(月)～8月31日(日)</p>
      <Badge className="bg-red-500 px-4 py-2 text-lg text-white">
        応募受付中！
      </Badge>
    </CardContent>
  </Card>

  <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-100 to-pink-100 shadow-xl dark:from-purple-900/30 dark:to-pink-900/30">
    <CardHeader className="text-center">
      <CardTitle className="font-bold text-2xl text-purple-600 dark:text-purple-400">
        <MapPinIcon className="mr-2 inline h-6 w-6" />
        イベント会場
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4 text-center">
      <p className="text-lg">
        愛知県東海市
        <br />
        太田川駅西広場
      </p>
      <Link to="/events/wakiaiai4">
        <Button
          variant="outline"
          className="border-purple-300 text-purple-600 hover:bg-purple-50"
        >
          <ExternalLinkIcon className="mr-2 h-4 w-4" />
          会場詳細を見る
        </Button>
      </Link>
    </CardContent>
  </Card>
</div>

{
  /* Participation Method */
}
;<Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
  <CardHeader className="text-center">
    <CardTitle className="font-bold text-3xl">参加方法</CardTitle>
  </CardHeader>
  <CardContent className="p-8">
    <div className="space-y-6 text-center">
      <div className="rounded-lg border-2 border-orange-300 bg-orange-200 p-6 dark:bg-orange-800/30">
        <h3 className="mb-4 font-bold text-2xl text-orange-700 dark:text-orange-300">
          必須タグ
        </h3>
        <p className="font-bold text-3xl text-orange-900 dark:text-orange-100">
          「!和気あいAI2025ハロウィン企画」
        </p>
        <p className="mt-4 text-orange-700 dark:text-orange-300">
          このタグをつけて作品を投稿するとイベントに参加できます！
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border-2 border-purple-300 bg-purple-100 p-6 dark:bg-purple-900/30">
          <h4 className="mb-3 font-bold text-purple-700 text-xl dark:text-purple-300">
            Aipictorsとしてのポスター展示
          </h4>
          <p className="text-purple-600 dark:text-purple-200">
            優秀作品はAipictors運営が作成する和気あいAI4のポスターに掲載されます
          </p>
        </div>

        <div className="rounded-lg border-2 border-yellow-300 bg-yellow-100 p-6 dark:bg-yellow-900/30">
          <h4 className="mb-3 font-bold text-xl text-yellow-700 dark:text-yellow-300">
            Aipictors冊子への掲載
          </h4>
          <p className="text-yellow-600 dark:text-yellow-200">
            Aipictors運営が作成する冊子にも作品掲載のチャンスがあり、イベント会場で配布・販売されます
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
        <Button
          size="lg"
          className="transform bg-gradient-to-r from-orange-500 to-red-500 px-10 py-6 font-bold text-white text-xl shadow-xl transition-all duration-300 hover:scale-105 hover:from-orange-600 hover:to-red-600"
          onClick={() => {
            const url = `/new/image?event=wakiaiai4-halloween&tag=${encodeURIComponent("!和気あいAI2025ハロウィン企画")}`
            window.open(url, "_blank")
          }}
        >
          🎃 今すぐ作品投稿
        </Button>

        <Link to="/events/wakiaiai4">
          <Button
            size="lg"
            variant="outline"
            className="border-purple-300 px-10 py-6 font-bold text-purple-600 text-xl hover:bg-purple-50"
          >
            イベント詳細
          </Button>
        </Link>
      </div>
    </div>
  </CardContent>
</Card>

export const meta: MetaFunction = () => {
  return [
    { title: "ハロウィン2025企画 - 和気あいAI4連動特別イベント" },
    {
      name: "description",
      content:
        "和気あいAI4と連動したハロウィン特別企画。生成AIを使って素敵なハロウィン作品を投稿しよう！",
    },
  ]
}

const appEventQuery = graphql(
  `query AppEvent($slug: String!, $offset: Int!, $limit: Int!, $where: WorksWhereInput!) {
    appEvent(slug: $slug) {
      id
      title
      description
      slug
      worksCount
      works(offset: $offset, limit: $limit, where: $where) {
        ...EventWorkListItem
      }
    }
  }`,
  [EventWorkListItemFragment],
)
