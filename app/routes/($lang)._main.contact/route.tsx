import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { Link } from "@remix-run/react"
import { config, META } from "~/config"
import { useTranslation } from "~/hooks/use-translation"
import { createMeta } from "~/utils/create-meta"
import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import {
  MessageCircleIcon,
  MailIcon,
  HelpCircleIcon,
  ExternalLinkIcon,
} from "lucide-react"

export const meta: MetaFunction = (props) => {
  return createMeta(META.CONTACT, undefined, props.params.lang)
}

export async function loader(_props: LoaderFunctionArgs) {
  // const redirectResponse = checkLocaleRedirect(props.request)

  // if (redirectResponse) {
  //   return redirectResponse
  // }

  return {}
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneMonth,
})

export default function Contact() {
  const t = useTranslation()

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      {/* ヘッダー */}
      <div className="space-y-4 text-center">
        <h1 className="font-bold text-3xl tracking-tight">
          {t("お問い合わせ", "Contact Us")}
        </h1>
        <p className="text-lg text-muted-foreground">
          {t(
            "ご質問やご要望がございましたら、お気軽にお問い合わせください",
            "If you have any questions or requests, please feel free to contact us",
          )}
        </p>
      </div>

      {/* お問い合わせオプション */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* チャットサポート */}
        <Card className="transition-all duration-200 hover:border-primary/50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
              <MessageCircleIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-xl">
              {t("チャットサポート", "Chat Support")}
            </CardTitle>
            <CardDescription>
              {t(
                "リアルタイムでサポートチームとチャットができます",
                "Chat with our support team in real-time",
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link to="/support/chat">
              <Button size="lg" className="w-full">
                <MessageCircleIcon className="mr-2 h-4 w-4" />
                {t("チャットで問い合わせる", "Contact via Chat")}
              </Button>
            </Link>
            <p className="mt-2 text-muted-foreground text-sm">
              {t(
                "平均応答時間: 数分以内",
                "Average response time: Within minutes",
              )}
            </p>
          </CardContent>
        </Card>

        {/* 法人お問い合わせ */}
        <Card className="transition-all duration-200 hover:border-primary/50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <MailIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-xl">
              {t("法人お問い合わせ", "Corporate Inquiries")}
            </CardTitle>
            <CardDescription>
              {t(
                "ビジネス関連のお問い合わせはメールでご連絡ください",
                "For business-related inquiries, please contact us via email",
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button variant="outline" size="lg" className="w-full" asChild>
              <a href="mailto:aipictors@gmail.com">
                <MailIcon className="mr-2 h-4 w-4" />
                aipictors@gmail.com
                <ExternalLinkIcon className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <p className="mt-2 text-muted-foreground text-sm">
              {t(
                "営業日: 平日 9:00-18:00",
                "Business hours: Weekdays 9:00-18:00",
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ヘルプ情報 */}
      <Card className="bg-muted/50">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <HelpCircleIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <CardTitle className="text-lg">
              {t("お問い合わせ前にご確認ください", "Before contacting us")}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="mb-2 font-semibold text-sm">
                {t("よくある質問", "Frequently Asked Questions")}
              </h3>
              <Link
                to="/help"
                className="text-blue-600 text-sm hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {t("使い方ガイドを確認", "Check the User Guide")} →
              </Link>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-sm">
                {t("利用規約", "Terms of Service")}
              </h3>
              <Link
                to="/terms"
                className="text-blue-600 text-sm hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {t("利用規約を確認", "Check Terms of Service")} →
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 追加情報 */}
      <div className="space-y-2 text-center">
        <p className="text-muted-foreground text-sm">
          {t(
            "お問い合わせいただいた内容は、サービス向上のために活用させていただく場合があります",
            "Your inquiries may be used to improve our services",
          )}
        </p>
        <p className="text-muted-foreground text-sm">
          {t(
            "個人情報の取り扱いについては、プライバシーポリシーをご確認ください",
            "For information handling, please check our Privacy Policy",
          )}
        </p>
      </div>
    </div>
  )
}
