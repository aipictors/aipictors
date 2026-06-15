import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import policyMarkdownEnText from "~/assets/premium-coins-policy-en.md?raw"
import policyMarkdownText from "~/assets/premium-coins-policy.md?raw"
import { AppMarkdown } from "~/components/app/app-markdown"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { config, META } from "~/config"
import { useTranslation } from "~/hooks/use-translation"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = (props) => {
  return createMeta(META.PREMIUM_COINS_POLICY, undefined, props.params.lang)
}

export async function loader(_props: LoaderFunctionArgs) {
  return {}
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneMonth,
})

export default function PremiumCoinsPolicyPage() {
  const t = useTranslation()

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/settings/points">
              {t("コイン", "Coins")}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/premium-coins/policy">
              {t("プレミアムコイン規約", "Premium Coin Policy")}
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="space-y-3">
        <h1 className="font-bold text-3xl tracking-tight">
          {t(
            "プレミアムコイン規約・前払式支払手段に関する表示",
            "Premium Coin Policy and Prepaid Payment Instrument Notice",
          )}
        </h1>
        <p className="text-muted-foreground leading-7">
          {t(
            "プレミアムコインの有効期限、利用条件、返金方針、応援コインとの関係、ならびに資金決済法上の前払式支払手段に関する表示をまとめています。",
            "This page summarizes Premium Coin expiration, usage conditions, refund handling, support-coin treatment, and prepaid payment instrument disclosures.",
          )}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("重要なポイント", "Key points")}</CardTitle>
          <CardDescription>
            {t(
              "購入前に特に確認していただきたい項目です。",
              "Items we recommend reviewing before purchase.",
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm leading-7">
          <p>
            {t(
              "・購入したプレミアムコインは購入日から 3 か月で失効します。",
              "- Purchased Premium Coins expire three months after the purchase date.",
            )}
          </p>
          <p>
            {t(
              "・応援で受け取ったコインのうち、当社指定のものだけが Amazon ギフトカード交換の対象です。",
              "- Only designated support-received coins are eligible for Amazon gift card exchange.",
            )}
          </p>
          <p>
            {t(
              "・購入後のキャンセルや返金は、法令上必要な場合等を除き原則できません。",
              "- Cancellations and refunds are generally unavailable except where required by law or otherwise approved.",
            )}
          </p>
        </CardContent>
      </Card>

      <div className="prose prose-slate dark:prose-invert max-w-none">
        <AppMarkdown>{t(policyMarkdownText, policyMarkdownEnText)}</AppMarkdown>
      </div>
    </div>
  )
}
