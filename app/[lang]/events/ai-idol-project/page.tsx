import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { Metadata } from "next"

const EventAiIdolProjectPage = async () => {
  return (
    <div className="space-y-2 py-4">
      <div className={cn("grid gap-2 md:grid-flow-col md:grid-cols-2")}>
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
    </div>
  )
}

export const metadata: Metadata = {
  title: { absolute: "Ai Idol Project - Aipictors" },
  description:
    "Ai Idol Project（アイプロ）のご紹介、Aipictorsとの連携特設ページ",
  openGraph: {
    title: { absolute: "Ai Idol Project - Aipictors" },
    description:
      "Ai Idol Project（アイプロ）のご紹介、生成機能との連携特設ページです。",
    images: {
      url: "https://www.aipictors.com/wp-content/uploads/2023/07/2NSLUKmgXQni6HaM18FAVTbtd4xscq.webp",
    },
  },
  twitter: {
    title: { absolute: "Ai Idol Project - Aipictors" },
    description:
      "Ai Idol Project（アイプロ）のご紹介、Aipictorsとの連携特設ページ",
  },
}

export const revalidate = 3600

export default EventAiIdolProjectPage
