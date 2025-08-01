import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { cn } from "~/lib/utils"
import { eventUsers } from "~/routes/events.wakiaiai3/assets/event-users"
import { EventWakiaiaiCreatorCard } from "~/routes/events.wakiaiai/components/event-wakiaiai-creator-card"
import { EventWakiaiaiImage } from "~/routes/events.wakiaiai/components/event-wakiaiai-image"
import type { MetaFunction } from "@remix-run/react"
import { EventWakiaiaiFooter } from "~/routes/events.wakiaiai/components/event-wakiaiai-footer"
import { EventWakiaiaiHeader } from "~/routes/events.wakiaiai/components/event-wakiaiai-header"
import { config } from "~/config"
import type { HeadersFunction } from "@remix-run/cloudflare"

export default function Route() {
  const length = Math.floor(eventUsers.length / 3)

  const aUsers = eventUsers.filter((_, index) => {
    return index <= length
  })

  const bUsers = eventUsers.filter((_, index) => {
    return length < index && index <= length * 2
  })

  const cUsers = eventUsers.filter((_, index) => {
    return length * 2 < index && index < eventUsers.length
  })

  return (
    <>
      <EventWakiaiaiHeader
        title={"和気あいAI３＠音楽の秋🍁"}
        noLatestEventLink
      />
      <main className="container-shadcn-ui space-y-2">
        <div className="flex flex-col items-center md:flex-row">
          <div className="flex flex-grow-3">
            <EventWakiaiaiImage
              alt={"和気あいAI3"}
              imageURL={
                "https://firebasestorage.googleapis.com/v0/b/kwkjsui8ghyt93ai5feb.appspot.com/o/events%2Fwakiaiai%2Fwakiaiai3_top_ver2.png?alt=media&token=2b316965-9868-44d4-9b99-0a37725b00b5"
              }
            />
          </div>
          <div className="w-full flex-2 space-y-8 py-8 md:px-4">
            <div className="space-y-4">
              <h2 className="font-bold text-green-500 text-lg">
                {"2024年10月19日（土）"}
              </h2>
              <h1 className={"font-bold text-4xl text-green-500"}>
                {"和気あいAI３＠音楽の秋🍁"}
              </h1>
            </div>
            <p className="leading-relaxed">
              {
                "生成AI仲間と出会える！全国一アットホームな生成AIを利用したイラストの展示やグッズ等の展示・即売会、第三回"
              }
            </p>
            <p className="leading-relaxed">
              {
                "第三回目はAIイラストだけじゃない！名古屋ゲームミュージックアンサンブル様とコラボ✨"
              }
            </p>
          </div>
        </div>
        <div className={cn("grid gap-2 md:grid-flow-col md:grid-cols-2")}>
          <Card>
            <CardHeader>
              <CardTitle>{"10月19日（土） 10時〜16時"}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                {
                  "愛知の生成AIコミュニティを盛り上げよう！一般参加は無料！本イベントは、主に画像生成AIを利用したイラストの展示及び即売会となります。本イベントにおけるデモンストレーションや展示を通じて、AIを利用した創作の楽しさ、利便性、注意すべき点などをAI利用者、一般参加者ともに周知することを考え、企画致しました。屋外のイベントですので、どなたでもお気軽に立ち寄ることができます！"
                }
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{"名古屋鉄道太田川駅から1分"}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                {
                  "お車でお越しの際は、東海市芸術劇場併設の駐車場又は近隣商業施設の駐車場をご利用ください。"
                }
              </p>
              <p>
                {
                  "即売会：太田川駅西広場 大屋根広場（愛知県東海市大田町下浜田）"
                }
              </p>
            </CardContent>
          </Card>
        </div>
        <iframe
          title="Google Map"
          className="h-400 w-full rounded border-0"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d173236.96306047565!2d136.8223456376915!3d35.06173419127466!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x60037fbd4e27a501%3A0xced4a78d8bbf60fe!2z5aSq55Sw5bed6aeF6KW_5bqD5aC077yI5aSn5bGL5qC55bqD5aC077yJ!5e0!3m2!1sja!2sjp!4v1688692547024!5m2!1sja!2sjp"
          width="100%"
          height={400}
          style={{ border: 0 }}
          allowFullScreen={true}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <div className={"grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3"}>
          {aUsers.map((user, _index) => (
            <EventWakiaiaiCreatorCard key={user.name} user={user} />
          ))}
        </div>

        <div className={"grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3"}>
          {bUsers.map((user, _index) => (
            <EventWakiaiaiCreatorCard key={user.name} user={user} />
          ))}
        </div>

        <div className={"grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3"}>
          {cUsers.map((user, _index) => (
            <EventWakiaiaiCreatorCard key={user.name} user={user} />
          ))}
        </div>
      </main>
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
      description:
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
