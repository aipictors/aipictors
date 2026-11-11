import text from "~/assets/specified-commercial-transaction-act.md?raw"
import { AppMarkdown } from "~/components/app/app-markdown"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { useLoaderData } from "@remix-run/react"
import { useTranslation } from "~/hooks/use-translation"
import { config, META } from "~/config"
import { createMeta } from "~/utils/create-meta"
import { BuildingIcon, InfoIcon, FileTextIcon, MapPinIcon } from "lucide-react"

export const meta: MetaFunction = (props) => {
  return createMeta(
    META.SPECIFIED_COMMERCIAL_TRANSACTION,
    undefined,
    props.params.lang,
  )
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneMonth,
})

export async function loader(_props: LoaderFunctionArgs) {
  // const redirectResponse = checkLocaleRedirect(props.request)

  // if (redirectResponse) {
  //   return redirectResponse
  // }

  const company = [
    {
      title: "商号",
      content: "Aipictors株式会社",
      enContent: "AIPICTORS K.K.",
    },
    {
      title: "住所",
      content: "〒530-0001 大阪府大阪市北区梅田1丁目2番2号 大阪駅前第2ビル12-12",
      enContent: "12-12 Osaka Ekimae Daini Building, 1-2-2 Umeda, Kita-ku, Osaka 530-0001, Japan",
    },
    {
      title: "電話番号",
      content: "080-4766-8781（平日 10:00〜17:00、土日祝日は休み）",
      enContent: "+81-80-4766-8781 (Weekdays 10:00-17:00 JST, closed on weekends and holidays)",
    },
    {
      title: "代表取締役",
      content: "中塚季利人",
      enContent: "KIRITO NAKATSUKA",
    },
  ]

  return {
    text,
    company,
  }
}

export default function SpecifiedCommercialTransactionActPage () {
  const data = useLoaderData<typeof loader>()

  const t = useTranslation()

  if (data === null) {
    return null
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      {/* ヘッダー */}
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
          <FileTextIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
        </div>
        <h1 className="font-bold text-3xl tracking-tight">
          {t(
            "特定商取引法に基づく表記",
            "Specified Commercial Transaction Act",
          )}
        </h1>
        <p className="text-muted-foreground">
          {t(
            "法的に必要な取引情報と会社概要をご確認いただけます",
            "You can check legally required transaction information and company overview",
          )}
        </p>
      </div>

      {/* 会社情報 */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <BuildingIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <CardTitle className="text-xl">
              {t("会社情報", "Company Information")}
            </CardTitle>
          </div>
          <CardDescription>
            {t(
              "Aipictorsを運営する会社の基本情報です",
              "Basic information about the company that operates Aipictors",
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[96px]">
                    {t("項目", "Item")}
                  </TableHead>
                  <TableHead>{t("日本語", "Japanese")}</TableHead>
                  <TableHead>{t("English", "English")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.company.map((item) => (
                  <TableRow key={`company-${item.title}`}>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell>{item.content}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.enContent}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 所在地（建物の外観と地図） */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <MapPinIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
            <CardTitle className="text-xl">{t("所在地", "Location")}</CardTitle>
          </div>
          <CardDescription>
            {t(
              "〒530-0001 大阪府大阪市北区梅田1丁目2番2号 大阪駅前第2ビル12-12",
              "12-12 Osaka Ekimae Daini Building, 1-2-2 Umeda, Kita-ku, Osaka",
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <figure className="space-y-1">
            <img
              src="/images/company/osaka-ekimae-2nd-building.jpg"
              alt={t("大阪駅前第2ビルの外観", "Osaka Ekimae Daini Building")}
              width={960}
              height={720}
              loading="lazy"
              className="aspect-[4/3] w-full rounded-md object-cover"
            />
            <figcaption className="text-muted-foreground text-xs">
              {t("大阪駅前第2ビルの外観", "Osaka Ekimae Daini Building")}
              {" / "}
              <a
                href="https://commons.wikimedia.org/wiki/File:Osaka_Ekimae_2nd_Building_2025.JPG"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                {"Photo: Fotointheworld, CC BY 4.0"}
              </a>
            </figcaption>
          </figure>
          <iframe
            title={t("所在地の地図", "Map")}
            src="https://www.google.com/maps?q=%E5%A4%A7%E9%98%AA%E9%A7%85%E5%89%8D%E7%AC%AC2%E3%83%93%E3%83%AB%20%E5%A4%A7%E9%98%AA%E5%BA%9C%E5%A4%A7%E9%98%AA%E5%B8%82%E5%8C%97%E5%8C%BA%E6%A2%85%E7%94%B01-2-2&output=embed"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="aspect-[4/3] w-full rounded-md border-0"
          />
        </CardContent>
      </Card>

      {/* 事業内容 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <InfoIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
            <span>{t("事業内容", "Business Description")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="mb-2 flex items-center space-x-2">
              <Badge variant="secondary">
                {t("コンテンツプラットフォーム", "Content Platform")}
              </Badge>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              {t(
                "「Aipictors」 AIコンテンツに出会えるプラットフォームを提供しています。新しいクリエイター、ユーザとのコミュニケーションを支えます。",
                "We provide a platform where you can discover AI-generated content with Aipictors, supporting communication with new creators and users.",
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 特定商取引法表記 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            {t(
              "特定商取引法に基づく表記",
              "Specified Commercial Transaction Act Details",
            )}
          </CardTitle>
          <CardDescription>
            {t(
              "販売条件、支払い方法、返品・交換等に関する詳細情報",
              "Detailed information about sales conditions, payment methods, returns and exchanges",
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <AppMarkdown className="leading-relaxed">{data.text}</AppMarkdown>
          </div>
        </CardContent>
      </Card>

      {/* フッター情報 */}
      <div className="space-y-2 border-t pt-8 text-center">
        <p className="text-muted-foreground text-sm">
          {t(
            "この表記についてご質問がございましたら、お問い合わせください",
            "If you have any questions about this information, please contact us",
          )}
        </p>
        <p className="text-muted-foreground text-xs">
          {t("最終更新: 2026年11月", "Last updated: November 2026")}
        </p>
      </div>
    </div>
  )
}
