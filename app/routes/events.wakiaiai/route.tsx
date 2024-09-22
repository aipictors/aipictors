import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { cn } from "~/lib/utils"
import { eventUsers } from "~/routes/events.wakiaiai/assets/event-users"
import { EventWakiaiaiCreatorCard } from "~/routes/events.wakiaiai/components/event-wakiaiai-creator-card"
import { EventWakiaiaiImage } from "~/routes/events.wakiaiai/components/event-wakiaiai-image"
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare"
import { Link } from "@remix-run/react"
import { MousePointerClickIcon } from "lucide-react"
import { EventWakiaiaiFooter } from "~/routes/events.wakiaiai/components/event-wakiaiai-footer"
import { EventWakiaiaiHeader } from "~/routes/events.wakiaiai/components/event-wakiaiai-header"
import { checkLocaleRedirect } from "~/utils/check-locale-redirect"
import { useTranslation } from "~/hooks/use-translation"

export default function Route() {
  const t = useTranslation()

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
      <EventWakiaiaiHeader title={t("和気あいAI", "Wakiaiai")} />
      <main className="container-shadcn-ui space-y-2">
        <div className="flex flex-col items-center md:flex-row">
          <div className="flex flex-grow-3">
            <EventWakiaiaiImage
              alt={t("和気あいAI", "Wakiaiai")}
              imageURL={
                "https://files.aipictors.com/e9ce2430-d643-4f76-b726-c67cab9ef4eb"
              }
              linkURL={"/posts/66168/"}
              linkTitle={"Aipictors"}
            />
          </div>
          <div className="w-full flex-2 space-y-8 py-8 md:px-4">
            <div className="space-y-4">
              <h2 className="font-bold text-blue-300 text-lg">
                {"2023年9月30日"}
              </h2>
              <h1 className={"font-bold text-4xl text-blue-300"}>
                {t("和気あいAI", "Wakiaiai")}
              </h1>
            </div>
            <p className="leading-relaxed">
              {t(
                "東海地方で初かもしれない、生成AIを利用したイラストの展示やグッズ等の展示即売会",
                "Possibly the first event in the Tokai region, featuring exhibitions and sales of AI-generated illustrations and goods.",
              )}
            </p>
            <Link
              to="/events/wakiaiai2"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant={"outline"} className="m-4 font-bold text-lg">
                {t("和気あいAI2開催決定", "Wakiaiai 2 Confirmed")}
                <MousePointerClickIcon className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
        <div className={cn("grid gap-2 md:grid-flow-col md:grid-cols-2")}>
          <Card>
            <CardHeader>
              <CardTitle>
                {t(
                  "9月30日（土） 10時〜16時",
                  "September 30 (Sat) 10:00-16:00",
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                {t(
                  "一般参加は無料！本イベントは、主に画像生成AIを利用したイラストの展示及び即売会となります。本イベントにおけるデモンストレーションや展示を通じて、AIを利用した創作の楽しさ、利便性、注意すべき点などをAI利用者、一般参加者ともに周知することを考え、企画致しました。",
                  "Admission is free! This event primarily showcases illustrations generated using AI, with sales as well. Through demonstrations and exhibitions, we aim to share the joy, convenience, and important considerations of AI-based creativity with AI users and the general public.",
                )}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>
                {t(
                  "名古屋鉄道太田川駅から1分",
                  "1 minute from Otagawa Station (Meitetsu Nagoya Line)",
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                {t(
                  "お車でお越しの際は、東海市芸術劇場併設の駐車場又は近隣商業施設の駐車場をご利用ください。",
                  "If arriving by car, please use the parking at Tokai City Arts Theatre or nearby shopping facilities.",
                )}
              </p>
              <p>
                {t(
                  "即売会：太田川駅西広場 大屋根広場（愛知県東海市大田町下浜田）",
                  "Sales event: Otagawa Station West Plaza, Large Roof Plaza (Ota Town, Tokai City, Aichi Prefecture)",
                )}
              </p>
              <p>
                {t(
                  "展示：東海市芸術劇場 4階ギャラリー（愛知県東海市大田町下浜田137）",
                  "Exhibition: 4th Floor Gallery, Tokai City Arts Theatre (137 Ota Town, Tokai City, Aichi Prefecture)",
                )}
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
            <EventWakiaiaiCreatorCard key={user.name} user={user} />
          ))}
        </div>
        <EventWakiaiaiImage
          alt={t("和気あいAI", "Wakiaiai")}
          imageURL={
            "https://files.aipictors.com/652f3da0-5bfd-492d-b11b-07d5c62e26ee"
          }
          linkURL={"/posts/66093/"}
          linkTitle={"Aipictors"}
        />
        <div className={"grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3"}>
          {bUsers.map((user, index) => (
            <EventWakiaiaiCreatorCard key={user.name} user={user} />
          ))}
        </div>
        <iframe
          className="rounded"
          style={{ border: 0 }}
          width="100%"
          height="400"
          src="https://www.youtube.com/embed/_VCTJxdKs3w"
          title="和気あいAI、会場紹介動画"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen={true}
        />
        <div className={"grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3"}>
          {cUsers.map((user, index) => (
            <EventWakiaiaiCreatorCard key={user.name} user={user} />
          ))}
        </div>
        <Card>
          <CardHeader>
            <CardTitle>
              {t(
                "クラウドファンディング応援スポンサーさま✨",
                "Crowdfunding Supporters✨",
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              {t(
                "AI TEC AI PICTURES様、erot様、haru@t2i(@3724_haru)様、KAMO@AI様、KarmaNeko様、nawashi様、Ozmo/AIart様、roiyaruRIZ様、sk panda様、STIS様、うほうほめもたろう様、える様、がーすー様、かけうどん様、かすみ様、さとー様、せぴぃ様、のとろ様、ミカエル翔@ShoSecAI様、花笠万夜様、街のパン屋さん様、甘党坊主様、京すけ様、呉春華様、今日桔梗様、沙乱・さみだれNFT様、神音様、猫黒夏躯様、白うさ王国観光課様、緋鏡悠様、碧燕工房様",
                "AI TEC AI PICTURES, erot, haru@t2i(@3724_haru), KAMO@AI, KarmaNeko, nawashi, Ozmo/AIart, roiyaruRIZ, sk panda, STIS, Uhuhomemotaro, El, Garsuu, Kakeudon, Kasumi, Sato, Sepii, Notoro, Michael Sho@ShoSecAI, Manya Hanagasa, Town Bakery, Sweet Monk, Kyousuke, Kure Haruka, Kyou Kikyō, Saran・SamidareNFT, Kamine, Nekokuro Natsu, Shiro Usagi Kingdom Tourism, Hikagami Yuu, Hekien Koubou.",
              )}
            </p>
          </CardContent>
        </Card>
        <EventWakiaiaiImage
          alt={t("和気あいAI", "Wakiaiai")}
          imageURL={
            "https://files.aipictors.com/e9ce2430-d643-4f76-b726-c67cab9ef4eb"
          }
          linkURL={"/posts/59815/"}
          linkTitle={"Aipictors"}
        />
      </main>
      <EventWakiaiaiFooter />
    </>
  )
}

export async function loader(props: LoaderFunctionArgs) {
  const redirectResponse = checkLocaleRedirect(props.request)

  if (redirectResponse) {
    return redirectResponse
  }

  return {}
}

export const meta: MetaFunction = (props) => {
  const lang = props.params.lang

  return [
    { title: "和気あいAI - 愛知県AIイラスト展示即売会" },
    {
      description:
        "東海地方で初かもしれない、生成AIを利用したイラストの展示やグッズ等の展示即売会",
    },
    {
      property: "og:title",
      content: "和気あいAI - 愛知県AIイラスト展示即売会",
    },
    {
      property: "og:description",
      content:
        "2023年9月30日（土）東海地方で初かもしれない、生成AIを利用したイラストの展示やグッズ等の展示即売会！",
    },
    {
      property: "og:image",
      content:
        "https://files.aipictors.com/e9ce2430-d643-4f76-b726-c67cab9ef4eb",
    },
    {
      name: "twitter:title",
      content: "和気あいAI - 愛知県AIイラスト展示即売会",
    },
    {
      name: "twitter:description",
      content:
        "2023年9月30日（土）東海地方で初かもしれない、生成AIを利用したイラストの展示やグッズ等の展示即売会！",
    },
  ]
}
