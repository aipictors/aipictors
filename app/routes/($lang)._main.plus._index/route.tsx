import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { Link } from "~/lib/app/locale-router"
import { CheckIcon, ChevronDownIcon } from "lucide-react"
import { useContext, useEffect } from "react"
import { Button } from "~/components/ui/button"
import { config, META } from "~/config"
import { AuthContext } from "~/contexts/auth-context"
import { useLiteOffer } from "~/hooks/use-lite-offer"
import { usePlusStatus } from "~/hooks/use-plus-status"
import { useTranslation } from "~/hooks/use-translation"
import { PlusAbout } from "~/routes/($lang)._main.plus._index/components/plus-about"
import { PlusCoinGuide } from "~/routes/($lang)._main.plus._index/components/plus-coin-guide"
import { PlusComparisonTable } from "~/routes/($lang)._main.plus._index/components/plus-comparison-table"
import { PlusFaq } from "~/routes/($lang)._main.plus._index/components/plus-faq"
import { PlusForm } from "~/routes/($lang)._main.plus._index/components/plus-form"
import { PlusHero } from "~/routes/($lang)._main.plus._index/components/plus-hero"
import { PlusNoteList } from "~/routes/($lang)._main.plus._index/components/plus-note-list"
import { createMeta } from "~/utils/create-meta"
import { toApproxUsdText } from "~/utils/to-approx-usd-text"
import { trackGrowthEvent } from "~/utils/track-growth-event"
import { AppJsonLdScript } from "~/components/app/app-jsonld-script"
import type { Product, WithContext } from "schema-dts"

/**
 * 料金プランの構造化データ（検索結果やAIの回答で価格が正しく伝わるように）
 */
const plusJsonLd: WithContext<Product> = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Aipictors+",
  description:
    "Aipictors のAI画像生成・投稿サイトの有料プラン。1回のクリックで4枚生成、毎日のフリーコインで1日最大200枚、広告の非表示、画像から生成など。",
  brand: { "@type": "Brand", name: "Aipictors" },
  url: `${config.siteURL}/plus`,
  offers: [
    { name: "ライト", price: 480 },
    { name: "スタンダード", price: 1980 },
    { name: "プレミアム", price: 3980 },
  ].map((plan) => ({
    "@type": "Offer" as const,
    name: plan.name,
    price: plan.price,
    priceCurrency: "JPY",
    availability: "https://schema.org/InStock" as const,
    url: `${config.siteURL}/plus`,
    priceSpecification: {
      "@type": "UnitPriceSpecification" as const,
      price: plan.price,
      priceCurrency: "JPY",
      referenceQuantity: {
        "@type": "QuantitativeValue" as const,
        value: 1,
        unitCode: "MON",
      },
    },
  })),
}

export const meta: MetaFunction = (props) => {
  return createMeta(META.PLUS, undefined, props.params.lang)
}

export async function loader(_props: LoaderFunctionArgs) {
  // const redirectResponse = checkLocaleRedirect(props.request)

  // if (redirectResponse) {
  //   return redirectResponse
  // }

  return {}
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.short,
})

/**
 * サブスク
 */
export default function Plus () {
  const t = useTranslation()
  const authContext = useContext(AuthContext)
  const plusStatus = usePlusStatus()
  const isNotMember = plusStatus === "guest" || plusStatus === "free"

  // プランのページが開かれた回数（未ログイン・プランなし・加入中に分けて数える）
  useEffect(() => {
    if (plusStatus !== "unknown") trackGrowthEvent("plus_view", plusStatus)
  }, [plusStatus])

  const isTrial = useLiteOffer().offer === "trial"

  const assurances = [
    t(
      "いつでもこのページから解約できます。解約後も更新日までは特典を使えます",
      "Cancel anytime from this page. You keep your benefits until the period you paid for ends.",
    ),
    isTrial
      ? t(
          "7日間の無料お試しは、はじめてプランに入る方のライト（月払い）が対象です。スタンダード・プレミアムの月払いは初月半額です（年払い・自動更新なしのパスは対象外）",
          "The 7-day free trial is for Lite (monthly) if you've never had a paid plan. Standard and Premium monthly plans are 50% off the first month. Yearly plans and passes aren't discounted.",
        )
      : t(
          "初月半額は、今プランに入っていない方の月払いが対象です（年払い・自動更新なしのパスは対象外）",
          "50% off the first month applies to monthly plans, for anyone not currently subscribed.",
        ),
    t(
      "お支払いは Stripe の決済画面でのクレジットカード決済です",
      "Secure card payment through Stripe. Cards issued outside Japan work too.",
    ),
  ]

  return (
    // スマホは画面下に申込みボタンを固定で出すので、その分だけ下を空ける
    <div className="mx-auto w-full max-w-6xl space-y-10 pb-28 md:space-y-16 md:pb-8">
      <AppJsonLdScript jsonLd={plusJsonLd} />
      <PlusHero />
      <section id="plans" className="scroll-mt-24 space-y-4">
        <div className="space-y-1">
          <h2 className="font-bold text-xl md:text-2xl">
            {t("プランを選ぶ", "Choose your plan")}
          </h2>
          <p className="text-muted-foreground text-sm">
            {t(
              "すべて税込です。月払いはいつでも解約でき、年払いは2か月分おトクです。",
              "Charged in Japanese yen (JPY), tax included. Dollar amounts are estimates — your card issuer sets the final rate.",
            )}
            <span className="hidden md:inline">
              {t(
                "上位プランへの変更は日割りの差額だけで切り替わります。",
                " Cancel anytime.",
              )}
            </span>
          </p>
        </div>
        {authContext.isLoggedIn ? (
          <PlusForm />
        ) : (
          <PlusAbout
            showFreePlan={true}
            isLoggedOut={true}
            showStickyCta={true}
          />
        )}
        {isNotMember && (
          <ul className="space-y-1.5 rounded-2xl border bg-muted/30 p-4 text-muted-foreground text-xs md:text-sm">
            {assurances.map((text) => (
              <li key={text} className="flex items-start gap-2">
                <CheckIcon className="mt-0.5 size-4 shrink-0 text-violet-500" />
                <span>{text}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
      <PlusComparisonTable />
      <PlusCoinGuide />
      <PlusFaq />
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 to-sky-500 px-6 py-8 text-center text-white md:py-10">
        <p className="font-extrabold text-2xl md:text-3xl">
          {t("1回で4枚、毎日もっと。", "Make more of every click.")}
        </p>
        <p className="mt-2 text-sm text-white/90">
          {t(
            "月額480円から。いつでも解約できます。",
            `From ¥480 a month (${toApproxUsdText(480)}). Cancel anytime.`,
          )}
        </p>
        <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="rounded-xl bg-white font-bold text-violet-700 hover:bg-white/90 dark:bg-white dark:text-violet-700"
          >
            <a href="#plans">{t("プランを選ぶ", "Choose a plan")}</a>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="rounded-xl border-white/70 bg-transparent text-white hover:bg-white/10 hover:text-white dark:border-white/70"
          >
            <Link to="/generation/about">
              {t("生成機能について", "How generation works")}
            </Link>
          </Button>
        </div>
      </section>
      {/* 長い注意事項はたたんでおく（開けばすべて読める） */}
      <details className="group rounded-2xl border px-4 py-3">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 font-bold text-sm [&::-webkit-details-marker]:hidden">
          <h2>{t("注意事項（加入期間・解約・返金について）", "The fine print (billing period, cancellation, refunds)")}</h2>
          <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
        </summary>
        <div className="pt-3 text-muted-foreground text-sm">
          <PlusNoteList />
          <p className="pt-3">
            {t(
              "この度はAipictorsをご利用いただき、誠にありがとうございます。",
              "Thank you for using Aipictors.",
            )}
          </p>
        </div>
      </details>
    </div>
  )
}
