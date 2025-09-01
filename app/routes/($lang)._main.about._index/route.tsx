import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { Link } from "@remix-run/react"
import { config, META } from "~/config"
import { useTranslation } from "~/hooks/use-translation"
import { createMeta } from "~/utils/create-meta"
import {
  BuildingIcon,
  MailIcon,
  ShieldCheckIcon,
  FileTextIcon,
  BookOpenIcon,
  HelpCircleIcon,
  MapIcon,
  PaletteIcon,
  ExternalLinkIcon,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"

export const meta: MetaFunction = (props) => {
  return createMeta(META.ABOUT, undefined, props.params.lang)
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

/**
 * サイトについて
 */
export default function About() {
  const t = useTranslation()

  const sections = [
    {
      icon: BuildingIcon,
      title: t("当サービスについて", "About Aipictors"),
      content: t(
        "当サービスはAIで生成されたイラストのコンテンツをテーマにコミュニケーション、創作活動するプラットフォームです。",
        "This service is a platform for communication and creative activities themed around AI-generated illustration content.",
      ),
    },
    {
      icon: BuildingIcon,
      title: t("運営会社について", "About the Operating Company"),
      content: t(
        "Aipictors株式会社が運営しております。お問い合わせは aipictors@gmail.com からお願い致します。",
        "Operated by Aipictors Inc. For inquiries, please contact aipictors@gmail.com.",
      ),
    },
  ]

  const linkSections = [
    {
      icon: MailIcon,
      title: t("お問い合わせ先", "Contact Information"),
      href: "/contact",
      linkText: t("こちら", "here"),
      description: t("ご質問やサポートについて", "For questions and support"),
    },
    {
      icon: ShieldCheckIcon,
      title: t("プライバシーポリシー", "Privacy Policy"),
      href: "/privacy",
      linkText: t(
        "個人情報の利用目的などについて",
        "For purposes of personal information usage, etc.",
      ),
      description: t(
        "個人情報の取り扱いについて",
        "About personal information handling",
      ),
    },
    {
      icon: FileTextIcon,
      title: t("利用規約", "Terms of Service"),
      href: "/terms",
      linkText: t("こちら", "here"),
      description: t("サービスのご利用にあたって", "For using the service"),
    },
    {
      icon: BookOpenIcon,
      title: t("ガイドライン", "Guidelines"),
      href: "/guideline",
      linkText: t("こちら", "here"),
      description: t("機能の使い方について", "For how to use the features"),
    },
    {
      icon: HelpCircleIcon,
      title: t("使い方ガイド", "User Guide"),
      href: "/help",
      linkText: t("こちら", "here"),
      description: t(
        "Aipictorsの使い方について詳しく",
        "Detailed information on how to use Aipictors",
      ),
    },
    {
      icon: MapIcon,
      title: t("ロードマップ", "Roadmap"),
      href: "/roadmap",
      linkText: t("こちら", "here"),
      description: t(
        "今後の機能開発計画や新機能について",
        "Future feature development plans and new features",
      ),
    },
    {
      icon: PaletteIcon,
      title: t("プレスキット", "Press Kit"),
      href: "/presskit",
      linkText: t("こちら", "here"),
      description: t(
        "当サービスのロゴ素材をダウンロード",
        "Download our service's logo materials",
      ),
      external: false,
    },
  ]

  return (
    <div className="container mx-auto max-w-4xl space-y-8 p-6">
      {/* ヘッダー */}
      <div className="space-y-4 text-center">
        <h1 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-4xl font-bold text-transparent">
          {t("本サイトについて", "About This Site")}
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          {t(
            "Aipictorsのサービス概要、運営情報、各種ガイドラインについてご案内いたします。",
            "Information about Aipictors' service overview, management details, and various guidelines.",
          )}
        </p>
      </div>

      {/* サービス・会社概要セクション */}
      <div className="grid gap-6 md:grid-cols-2">
        {sections.map((section) => (
          <Card key={section.title} className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <section.icon className="h-6 w-6 text-blue-600" />
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="leading-relaxed text-muted-foreground">
                {section.content}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* リンクセクション */}
      <div className="space-y-6">
        <h2 className="text-center text-2xl font-semibold">
          {t("関連リンク", "Related Links")}
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {linkSections.map((section) => (
            <Link
              key={section.title}
              to={section.href}
              {...(section.external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              className="group block h-full"
            >
              <div className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-6 transition-all duration-200 hover:border-blue-300 hover:bg-blue-50/50 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-600 dark:hover:bg-blue-950/30">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-100 transition-colors group-hover:bg-blue-200 dark:bg-blue-900 dark:group-hover:bg-blue-800">
                    <section.icon className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex flex-1 flex-col space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-lg font-semibold leading-tight text-gray-900 transition-colors group-hover:text-blue-700 dark:text-gray-100 dark:group-hover:text-blue-300">
                        {section.title}
                      </h3>
                      {section.external && (
                        <ExternalLinkIcon className="mt-1 h-4 w-4 shrink-0 text-gray-400 transition-colors group-hover:text-blue-500" />
                      )}
                    </div>
                    <p className="flex-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                      {section.description}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* フッター CTA */}
      <div className="space-y-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 p-8 text-center dark:from-blue-950/20 dark:to-purple-950/20">
        <h3 className="text-xl font-semibold">
          {t("Aipictorsを始めよう", "Get Started with Aipictors")}
        </h3>
        <p className="text-muted-foreground">
          {t(
            "AI生成イラストのコミュニティに参加して、創作活動を楽しみましょう。",
            "Join the AI-generated illustration community and enjoy creative activities.",
          )}
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/help"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
          >
            <HelpCircleIcon className="h-5 w-5" />
            {t("使い方を見る", "View Usage Guide")}
          </Link>
          <Link
            to="/roadmap"
            className="inline-flex items-center gap-2 rounded-lg border border-blue-600 px-6 py-3 font-medium text-blue-600 transition-colors hover:bg-blue-50 dark:hover:bg-blue-950/20"
          >
            <MapIcon className="h-5 w-5" />
            {t("ロードマップを見る", "View Roadmap")}
          </Link>
        </div>
      </div>
    </div>
  )
}
