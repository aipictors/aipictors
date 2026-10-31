import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { Link } from "@remix-run/react"
import { useContext } from "react"
import { Button } from "~/components/ui/button"
import { config, META } from "~/config"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { PlusAbout } from "~/routes/($lang)._main.plus._index/components/plus-about"
import { PlusCoinGuide } from "~/routes/($lang)._main.plus._index/components/plus-coin-guide"
import { PlusComparisonTable } from "~/routes/($lang)._main.plus._index/components/plus-comparison-table"
import { PlusFaq } from "~/routes/($lang)._main.plus._index/components/plus-faq"
import { PlusForm } from "~/routes/($lang)._main.plus._index/components/plus-form"
import { PlusHero } from "~/routes/($lang)._main.plus._index/components/plus-hero"
import { PlusNoteList } from "~/routes/($lang)._main.plus._index/components/plus-note-list"
import { createMeta } from "~/utils/create-meta"
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

  return (
    <div className="mx-auto w-full max-w-6xl space-y-12 pb-8 md:space-y-16">
      <AppJsonLdScript jsonLd={plusJsonLd} />
      <PlusHero />
      <section id="plans" className="scroll-mt-24 space-y-4">
        <div className="space-y-1">
          <h2 className="font-bold text-xl md:text-2xl">
            {t("プランを選ぶ", "Choose your plan")}
          </h2>
          <p className="text-muted-foreground text-sm">
            {t(
              "すべて月額・税込です。いつでも解約でき、上位プランへの変更は日割りの差額だけで切り替わります。",
              "Monthly, tax included. Cancel anytime; upgrades only charge the prorated difference.",
            )}
          </p>
        </div>
        {authContext.isLoggedIn ? (
          <PlusForm />
        ) : (
          <PlusAbout showFreePlan={true} isLoggedOut={true} />
        )}
      </section>
      <PlusComparisonTable />
      <PlusCoinGuide />
      <PlusFaq />
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-fuchsia-500 to-sky-500 px-6 py-8 text-center text-white md:py-10">
        <p className="font-extrabold text-2xl md:text-3xl">
          {t("1回で4枚、毎日もっと。", "4 images per click, every day.")}
        </p>
        <p className="mt-2 text-sm text-white/90">
          {t(
            "月額480円から。いつでも解約できます。",
            "From ¥480/month. Cancel anytime.",
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
              {t("生成機能について", "About generation")}
            </Link>
          </Button>
        </div>
      </section>
      <section className="space-y-2">
        <h2 className="font-bold text-lg">{t("注意事項", "Important Notes")}</h2>
        <div className="text-muted-foreground text-sm">
          <PlusNoteList />
        </div>
        <p className="pt-2 text-muted-foreground text-sm">
          {t(
            "この度はAipictorsをご利用いただき、誠にありがとうございます。",
            "Thank you for using Aipictors.",
          )}
        </p>
      </section>
    </div>
  )
}
