import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import text from "~/assets/terms.md?raw"
import enText from "~/assets/terms-en.md?raw"
import { AppMarkdown } from "~/components/app/app-markdown"
import { config, META } from "~/config"
import { useTranslation } from "~/hooks/use-translation"
import { createMeta } from "~/utils/create-meta"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { ScrollTextIcon, InfoIcon } from "lucide-react"

export const meta: MetaFunction = (props) => {
  return createMeta(META.TERMS, undefined, props.params.lang)
}

export async function loader(_props: LoaderFunctionArgs) {
  // const redirectResponse = checkLocaleRedirect(props.request)

  // if (redirectResponse) {
  //   return redirectResponse
  // }

  return {}
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneWeek,
})

export default function Terms() {
  const t = useTranslation()

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      {/* ヘッダー */}
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
          <ScrollTextIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h1 className="font-bold text-3xl tracking-tight">
          {t("利用規約", "Terms of Service")}
        </h1>
        <p className="text-lg text-muted-foreground">
          {t(
            "Aipictorsをご利用いただく前に、以下の利用規約をお読みください",
            "Please read the following terms of service before using Aipictors",
          )}
        </p>
      </div>

      {/* 注意事項 */}
      <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <InfoIcon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            <CardTitle className="text-lg text-orange-800 dark:text-orange-200">
              {t("重要なお知らせ", "Important Notice")}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-orange-700 dark:text-orange-300">
            {t(
              "本規約は日本語を正文とします。参考のために他の言語への翻訳文が作成されることがあっても、日本語の正文のみが効力を有します。",
              "These terms are originally written in Japanese. While translations may be provided for reference, only the original Japanese text is legally binding.",
            )}
          </CardDescription>
        </CardContent>
      </Card>

      {/* 利用規約本文 */}
      <Card>
        <CardContent className="p-8">
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <AppMarkdown className="leading-relaxed">
              {t(text, enText)}
            </AppMarkdown>
          </div>
        </CardContent>
      </Card>

      {/* フッター情報 */}
      <div className="space-y-2 border-t pt-8 text-center">
        <p className="text-muted-foreground text-sm">
          {t(
            "本規約についてご質問がございましたら、お問い合わせください",
            "If you have any questions about these terms, please contact us",
          )}
        </p>
        <p className="text-muted-foreground text-xs">
          {t("最終更新: 2024年12月", "Last updated: December 2024")}
        </p>
      </div>
    </div>
  )
}
