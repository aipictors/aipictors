import text from "~/assets/privacy-policy.md?raw"

import { AppMarkdown } from "~/components/app/app-markdown"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { ShieldCheckIcon, InfoIcon } from "lucide-react"
import { useTranslation } from "~/hooks/use-translation"

export default function Privacy () {
  const t = useTranslation()

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      {/* ヘッダー */}
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
          <ShieldCheckIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="font-bold text-3xl tracking-tight">
          {t("プライバシーポリシー", "Privacy Policy")}
        </h1>
        <p className="text-lg text-muted-foreground">
          {t(
            "お客様の個人情報保護に対する当社の取り組みについて説明します",
            "We explain our commitment to protecting your personal information",
          )}
        </p>
      </div>

      {/* 概要 */}
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <InfoIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <CardTitle className="text-blue-800 text-lg dark:text-blue-200">
              {t("プライバシー保護への取り組み", "Our Privacy Commitment")}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-blue-700 dark:text-blue-300">
            {t(
              "Aipictorsは、お客様の個人情報を適切に管理し、プライバシーを保護することを最優先に考えています。",
              "Aipictors prioritizes the proper management and protection of your personal information and privacy.",
            )}
          </CardDescription>
        </CardContent>
      </Card>

      {/* プライバシーポリシー本文 */}
      <Card>
        <CardContent className="p-8">
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <AppMarkdown className="leading-relaxed">{text}</AppMarkdown>
          </div>
        </CardContent>
      </Card>

      {/* フッター情報 */}
      <div className="space-y-2 border-t pt-8 text-center">
        <p className="text-muted-foreground text-sm">
          {t(
            "プライバシーポリシーについてご質問がございましたら、お問い合わせください",
            "If you have any questions about this privacy policy, please contact us",
          )}
        </p>
        <p className="text-muted-foreground text-xs">
          {t("最終更新: 2024年12月", "Last updated: December 2024")}
        </p>
      </div>
    </div>
  )
}
