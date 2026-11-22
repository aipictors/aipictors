import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Card, CardContent } from "~/components/ui/card"
import { Link } from "~/lib/app/locale-router"
import { eventUsers } from "~/routes/events.wakiaiai3/assets/event-users"
import { Wakiaiai3CreatorCard } from "~/routes/events.wakiaiai3/components/wakiaiai3-creator-card"
import type { MetaFunction } from "@remix-run/react"
import { EventWakiaiaiFooter } from "~/routes/events.wakiaiai/components/event-wakiaiai-footer"
import { EventWakiaiaiHeader } from "~/routes/events.wakiaiai/components/event-wakiaiai-header"
import { config } from "~/config"
import type { HeadersFunction } from "@remix-run/cloudflare"
import {
  ArrowRightIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  MusicIcon,
  TrainFrontIcon,
  UsersIcon,
} from "lucide-react"

const topImageURL =
  "https://firebasestorage.googleapis.com/v0/b/kwkjsui8ghyt93ai5feb.appspot.com/o/events%2Fwakiaiai%2Fwakiaiai3_top_ver2.png?alt=media&token=2b316965-9868-44d4-9b99-0a37725b00b5"

const eventInfo = [
  {
    icon: <CalendarIcon className="size-5" />,
    label: "開催日",
    value: "2024年10月19日（土）",
  },
  {
    icon: <ClockIcon className="size-5" />,
    label: "時間",
    value: "10:00〜16:00",
  },
  {
    icon: <MapPinIcon className="size-5" />,
    label: "会場",
    value: "太田川駅西広場 大屋根広場（愛知県東海市大田町下浜田）",
  },
  {
    icon: <TrainFrontIcon className="size-5" />,
    label: "アクセス",
    value:
      "名古屋鉄道 太田川駅から徒歩1分。お車の方は東海市芸術劇場併設の駐車場または近隣商業施設の駐車場をご利用ください。",
  },
  {
    icon: <UsersIcon className="size-5" />,
    label: "入場料",
    value: "無料（屋外開催のため、どなたでもお気軽にお立ち寄りいただけます）",
  },
]

export default function Route () {
  const shopCount = eventUsers.filter((user) =>
    user.types.includes("SHOP"),
  ).length

  const exhibitCount = eventUsers.filter((user) =>
    user.types.includes("EXHIBIT"),
  ).length

  return (
    <>
      <EventWakiaiaiHeader
        title={"和気あいAI３＠音楽の秋🍁"}
        noLatestEventLink
      />
      <div className="bg-gradient-to-b from-orange-50 via-background to-background dark:from-orange-950/30">
        <main className="container-shadcn-ui space-y-12 py-6 md:space-y-16 md:py-10">
          <section className="grid items-center gap-6 md:grid-cols-[3fr_2fr] md:gap-10">
            <img
              alt={"和気あいAI3"}
              src={topImageURL}
              className="w-full rounded-xl object-cover shadow-lg"
            />
            <div className="space-y-5">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{"開催終了"}</Badge>
                <Badge className="bg-orange-500 text-white hover:bg-orange-500">
                  {"第3回"}
                </Badge>
              </div>
              <div className="space-y-2">
                <p className="font-bold text-green-600 dark:text-green-400">
                  {"2024年10月19日（土）10:00〜16:00"}
                </p>
                <h1 className="font-bold text-3xl text-green-600 leading-tight md:text-4xl dark:text-green-400">
                  {"和気あいAI３＠音楽の秋🍁"}
                </h1>
              </div>
              <p className="leading-relaxed">
                {
                  "生成AI仲間と出会える！全国一アットホームな生成AIを利用したイラストの展示やグッズ等の展示・即売会、第三回。"
                }
              </p>
              <p className="flex items-start gap-2 rounded-lg border border-orange-200 bg-orange-50 p-3 text-orange-900 text-sm leading-relaxed dark:border-orange-800 dark:bg-orange-950/40 dark:text-orange-100">
                <MusicIcon className="mt-0.5 size-4 shrink-0" />
                {
                  "第三回目はAIイラストだけじゃない！名古屋ゲームミュージックアンサンブル様とコラボ✨"
                }
              </p>
              <Link to="/events/wakiaiai4" className="inline-block">
                <Button>
                  {"最新の和気あいAI4はこちら"}
                  <ArrowRightIcon className="ml-2 size-4" />
                </Button>
              </Link>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="font-bold text-2xl">{"和気あいAIとは？"}</h2>
            <Card>
              <CardContent className="p-5 leading-relaxed md:p-6">
                {
                  "愛知の生成AIコミュニティを盛り上げよう！本イベントは、主に画像生成AIを利用したイラストの展示及び即売会です。デモンストレーションや展示を通じて、AIを利用した創作の楽しさ、利便性、注意すべき点などを、AI利用者と一般参加者の両方に知ってもらうことを考えて企画しました。"
                }
              </CardContent>
            </Card>
          </section>

          <section className="space-y-4">
            <h2 className="font-bold text-2xl">{"開催情報"}</h2>
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardContent className="p-5 md:p-6">
                  <dl className="space-y-4">
                    {eventInfo.map((item) => (
                      <div key={item.label} className="flex gap-3">
                        <div className="mt-0.5 shrink-0 text-green-600 dark:text-green-400">
                          {item.icon}
                        </div>
                        <div className="min-w-0">
                          <dt className="font-semibold text-sm">
                            {item.label}
                          </dt>
                          <dd className="text-muted-foreground text-sm leading-relaxed">
                            {item.value}
                          </dd>
                        </div>
                      </div>
                    ))}
                  </dl>
                </CardContent>
              </Card>
              <iframe
                title="会場の地図（太田川駅西広場 大屋根広場）"
                className="h-72 w-full rounded-xl border-0 bg-muted md:h-full md:min-h-80"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d173236.96306047565!2d136.8223456376915!3d35.06173419127466!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x60037fbd4e27a501%3A0xced4a78d8bbf60fe!2z5aSq55Sw5bed6aeF6KW_5bqD5aC077yI5aSn5bGL5qC55bqD5aC077yJ!5e0!3m2!1sja!2sjp!4v1688692547024!5m2!1sja!2sjp"
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <h2 className="font-bold text-2xl">{"参加クリエイター"}</h2>
              <p className="text-muted-foreground text-sm">
                {`${eventUsers.length}組（出展 ${shopCount}・展示 ${exhibitCount}）`}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {eventUsers.map((user) => (
                <Wakiaiai3CreatorCard key={user.name} user={user} />
              ))}
            </div>
          </section>
        </main>
      </div>
      <EventWakiaiaiFooter />
    </>
  )
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneDay,
})

export const meta: MetaFunction = () => {
  return [
    { title: "和気あいAI3- 愛知県AIイラスト展示即売会" },
    {
      name: "description",
      content:
        "東海地方で初かもしれない、生成AIを利用したイラストの展示やグッズ等の展示即売会",
    },
    {
      property: "og:title",
      content: "和気あいAI3 - 愛知県AIイラスト展示即売会",
    },
    {
      property: "og:description",
      content:
        "東海の生成AI界隈を盛り上げよう！2024年10月19日（土）生成AIを利用したイラストの展示やグッズ等の展示即売会、第三回！",
    },
    {
      property: "og:image",
      content:
        "https://firebasestorage.googleapis.com/v0/b/kwkjsui8ghyt93ai5feb.appspot.com/o/events%2Fwakiaiai%2Fwakiaiai3_sns.png?alt=media&token=a15a4637-65e6-44c2-808b-5302473221b7",
    },
    {
      name: "twitter:title",
      content: "和気あいAI3 - 愛知県AIイラスト展示即売会",
    },
    {
      name: "twitter:description",
      content:
        "東海の生成AI界隈を盛り上げよう！2024年10月19日（土）生成AIを利用したイラストの展示やグッズ等の展示即売会、第三回！",
    },
  ]
}
