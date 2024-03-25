import { eventUsers } from "@/app/[lang]/events/wakiaiai2/_assets/event-users"
import { EventCreatorCard } from "@/app/[lang]/events/wakiaiai2/_components/event-creator-card"
import { EventImage } from "@/app/[lang]/events/wakiaiai2/_components/event-image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { MousePointerClickIcon } from "lucide-react"
import type { Metadata } from "next"

const EventWakiaiaiPage = async () => {
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
    <div className="space-y-2 py-4">
      <div className="flex flex-col items-center md:flex-row">
        <div className="flex flex-grow-3">
          <EventImage
            alt={"和気あいAI"}
            imageURL={
              "https://firebasestorage.googleapis.com/v0/b/kwkjsui8ghyt93ai5feb.appspot.com/o/events%2Fwakiaiai%2Fwakiaiai2_top.webp?alt=media&token=678241ea-c5de-4cf4-992c-e0bb081f4cc7"
            }
          />
        </div>
        <div className="w-full flex-2 space-y-8 py-8 md:px-4">
          <div className="space-y-4">
            <h2 className="font-bold text-green-500 text-lg">
              {"2024年4月13日（土）"}
            </h2>
            <h1 className={"font-bold text-4xl text-green-500"}>
              {"和気あいAI２"}
            </h1>
          </div>
          <p className="leading-relaxed">
            {
              "東海地方唯一の、生成AIを利用したイラストの展示やグッズ等の展示・即売会、第二回"
            }
          </p>
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSdgK3cGQz7T1CrGpHz1Y7IVNmylA5zT66j6sDbJ9E-LuUA63w/viewform?usp=sf_link"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant={"outline"} className="m-4 font-bold text-lg">
              出展/展示参加募集3/20〆切
              <MousePointerClickIcon className="ml-2" />
            </Button>
          </a>
        </div>
      </div>
      <div className={cn("grid gap-2 md:grid-flow-col md:grid-cols-2")}>
        <Card>
          <CardHeader>
            <CardTitle>{"4月13日（土） 10時〜16時"}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              {
                "一般参加は無料！本イベントは、主に画像生成AIを利用したイラストの展示及び即売会となります。本イベントにおけるデモンストレーションや展示を通じて、AIを利用した創作の楽しさ、利便性、注意すべき点などをAI利用者、一般参加者ともに周知することを考え、企画致しました。"
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
              {"即売会：太田川駅西広場 大屋根広場（愛知県東海市大田町下浜田）"}
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
        {aUsers.map((user, index) => (
          <EventCreatorCard key={user.name} user={user} />
        ))}
      </div>

      <div className={"grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3"}>
        {bUsers.map((user, index) => (
          <EventCreatorCard key={user.name} user={user} />
        ))}
      </div>

      <div className={"grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3"}>
        {cUsers.map((user, index) => (
          <EventCreatorCard key={user.name} user={user} />
        ))}
      </div>

      <footer className="bg-gray-200 p-4 text-center">
        <p className="mt-2 text-gray-600 text-sm">
          © 2024 和気あいAI. All rights reserved.
        </p>
        <div className="mt-4">
          <a href="https://twitter.com/waki_ai_ai_kot" className="mx-2 text-sm">
            X（Twitter）
          </a>
          <a
            href="mailto:kotoba.no.aya.2022@gmail.com"
            className="mx-2 text-sm"
          >
            主催Mail
          </a>
        </div>
      </footer>
    </div>
  )
}

export const metadata: Metadata = {
  title: { absolute: "和気あいAI2 - 愛知県AIイラスト展示即売会" },
  description:
    "東海地方で初かもしれない、生成AIを利用したイラストの展示やグッズ等の展示即売会",
  openGraph: {
    title: { absolute: "和気あいAI2 - 愛知県AIイラスト展示即売会" },
    description:
      "2024年4月13日（土）東海地方で初かもしれない、生成AIを利用したイラストの展示やグッズ等の展示即売会、第二回！",
    images: {
      url: "https://www.aipictors.com/wp-content/uploads/2023/07/2NSLUKmgXQni6HaM18FAVTbtd4xscq.webp",
    },
  },
  twitter: {
    title: { absolute: "和気あいAI2 - 愛知県AIイラスト展示即売会" },
    description:
      "2024年4月13日（土）東海地方で初かもしれない、生成AIを利用したイラストの展示やグッズ等の展示即売会、第二回！",
  },
}

export default EventWakiaiaiPage
