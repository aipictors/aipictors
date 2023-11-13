import { eventUsers } from "@/app/[lang]/events/wakiaiai/_assets/event-users"
import { EventCreatorCard } from "@/app/[lang]/events/wakiaiai/_components/event-creator-card"
import { EventImage } from "@/app/[lang]/events/wakiaiai/_components/event-image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
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
    <div className="min-h-screen space-y-2 py-2 px-2 max-w-container-xl mx-auto">
      <div className="flex flex-col md:flex-row items-center">
        <div className="flex flex-grow-3">
          <EventImage
            alt={"和気あいAI"}
            imageURL={
              "https://www.aipictors.com/wp-content/uploads/2023/07/XVzvtp28cfh6CQaMT9Rk0yJFA4rsgN.webp"
            }
            linkURL={"https://www.aipictors.com/works/66168/"}
            linkTitle={"Aipictors"}
          />
        </div>
        <div className="flex-2 px-4 md:px-8 py-8 space-y-8">
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-blue-300">
              {"2023年9月30日"}
            </h2>
            <h1 className={"text-4xl font-bold text-blue-300"}>
              {"和気あいAI"}
            </h1>
          </div>
          <p className="leading-relaxed">
            {
              "東海地方で初かもしれない、生成AIを利用したイラストの展示やグッズ等の展示即売会"
            }
          </p>
        </div>
      </div>
      <div className={cn("grid md:grid-cols-2 md:grid-flow-col gap-2")}>
        <Card>
          <CardHeader>
            <CardTitle>{"9月30日（土） 10時〜16時"}</CardTitle>
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
            <p>
              {
                "展示：東海市芸術劇場 4階ギャラリー（愛知県東海市大田町下浜田137）"
              }
            </p>
          </CardContent>
        </Card>
      </div>
      <iframe
        title="Google Map"
        className="rounded-md w-full h-400 border-0"
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d173236.96306047565!2d136.8223456376915!3d35.06173419127466!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x60037fbd4e27a501%3A0xced4a78d8bbf60fe!2z5aSq55Sw5bed6aeF6KW_5bqD5aC077yI5aSn5bGL5qC55bqD5aC077yJ!5e0!3m2!1sja!2sjp!4v1688692547024!5m2!1sja!2sjp"
        width="100%"
        height={400}
        style={{ border: 0 }}
        allowFullScreen={true}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <div className={"grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2"}>
        {aUsers.map((user, index) => (
          <EventCreatorCard key={user.name} user={user} />
        ))}
      </div>
      <EventImage
        alt={"和気あいAI"}
        imageURL={
          "https://www.aipictors.com/wp-content/uploads/2023/07/2NSLUKmgXQni6HaM18FAVTbtd4xscq.webp"
        }
        linkURL={"https://www.aipictors.com/works/66093/"}
        linkTitle={"Aipictors"}
      />
      <div className={"grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2"}>
        {bUsers.map((user, index) => (
          <EventCreatorCard key={user.name} user={user} />
        ))}
      </div>
      <iframe
        className="rounded-md"
        style={{ border: 0 }}
        width="100%"
        height="400"
        src="https://www.youtube.com/embed/_VCTJxdKs3w"
        title="和気あいAI、会場紹介動画"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen={true}
      />
      <div className={"grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2"}>
        {cUsers.map((user, index) => (
          <EventCreatorCard key={user.name} user={user} />
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{"クラウドファンディング応援スポンサーさま✨"}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            {
              "AI TEC AI PICTURES様、erot様、haru@t2i(@3724_haru)様、KAMO@AI様、KarmaNeko様、nawashi様、Ozmo/AIart様、roiyaruRIZ様、sk panda様、STIS様、うほうほめもたろう様、える様、がーすー様、かけうどん様、かすみ様、さとー様、せぴぃ様、のとろ様、ミカエル翔@ShoSecAI様、花笠万夜様、街のパン屋さん様、甘党坊主様、京すけ様、呉春華様、今日桔梗様、沙乱・さみだれNFT様、神音様、猫黒夏躯様、白うさ王国観光課様、緋鏡悠様、碧燕工房様"
            }
          </p>
        </CardContent>
      </Card>
      <EventImage
        alt={"和気あいAI"}
        imageURL={
          "https://www.aipictors.com/wp-content/uploads/2023/06/FDfUikjd67cARVC30vePmGJMn4zL81.webp"
        }
        linkURL={"https://www.aipictors.com/works/59815/"}
        linkTitle={"Aipictors"}
      />
    </div>
  )
}

export const metadata: Metadata = {
  title: { absolute: "和気あいAI - 愛知県AIイラスト展示即売会" },
  description:
    "東海地方で初かもしれない、生成AIを利用したイラストの展示やグッズ等の展示即売会",
  openGraph: {
    title: { absolute: "和気あいAI - 愛知県AIイラスト展示即売会" },
    description:
      "2023年9月30日（土）東海地方で初かもしれない、生成AIを利用したイラストの展示やグッズ等の展示即売会！",
    images: {
      url: "https://www.aipictors.com/wp-content/uploads/2023/07/2NSLUKmgXQni6HaM18FAVTbtd4xscq.webp",
    },
  },
  twitter: {
    title: { absolute: "和気あいAI - 愛知県AIイラスト展示即売会" },
    description:
      "2023年9月30日（土）東海地方で初かもしれない、生成AIを利用したイラストの展示やグッズ等の展示即売会！",
  },
}

export const revalidate = 3600

export default EventWakiaiaiPage
