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
import { BuildingIcon, InfoIcon, FileTextIcon } from "lucide-react"

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
      content: "大阪府大阪市北区梅田１丁目２番２号大阪駅前第２ビル１２－１２",
      enContent: "1-2-2 Osaka Station Building 2 12-12 Umeda Kita-ku",
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

export default function SpecifiedCommercialTransactionActPage() {
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
        <p className="text-lg text-muted-foreground">
          {t(
            "特定商取引に関する法律に基づく、販売者の情報を記載しています",
            "Information about the seller based on the Specified Commercial Transaction Act",
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
              <TableCaption>
                {t("会社情報", "Company Information")}
              </TableCaption>
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
                {data.company.map((item, index) => (
                  <TableRow key={index}>
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
          {t("最終更新: 2024年12月", "Last updated: December 2024")}
        </p>
      </div>
    </div>
  )
}
