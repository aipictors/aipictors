import { Link } from "~/lib/app/locale-router"
import { ImagesIcon, SparklesIcon, WalletIcon, ZapIcon } from "lucide-react"
import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"
import { planCtaClassName } from "~/routes/($lang)._main.plus._index/components/pass-plan-description"
import { getPlanSpec } from "~/routes/($lang)._main.plus._index/utils/plan-specs"
import { toApproxUsdText } from "~/utils/to-approx-usd-text"
import { toMoneyNumberText } from "~/utils/to-money-number-text"
import { toFirstMonthPrice, useFirstMonthOffer } from "~/hooks/use-first-month-offer"
import { TRIAL_DAYS, useLiteOffer } from "~/hooks/use-lite-offer"

const sampleImages = [
  "https://assets.aipictors.com/ff478cc0-35ad-12f8-d945-2511b5a49bd8_11zon.webp",
  "https://assets.aipictors.com/c068adee-e0c4-efa2-c7cf-739cc6df900c_11zon.webp",
  "https://assets.aipictors.com/5039b249-9672-b8a6-45f1-954c7a6512ae_11zon.webp",
  "https://assets.aipictors.com/b270cd3b-06a6-6e86-f74f-371800ecb57b_11zon.webp",
]

/**
 * プランページの最初の案内
 */
export function PlusHero() {
  const t = useTranslation()
  const lite = getPlanSpec("LITE")
  const premium = getPlanSpec("PREMIUM")
  const liteOffer = useLiteOffer()
  const isTrial = liteOffer.offer === "trial"
  // 確認中は、お試しとも初月半額とも書かない
  const isFirstMonthOffer = useFirstMonthOffer() && liteOffer.offer === "half"

  const points = [
    {
      icon: ImagesIcon,
      label: t("1回の生成", "Per click"),
      value: t(`${lite.imagesPerRequest}枚`, `${lite.imagesPerRequest} images`),
    },
    {
      icon: ZapIcon,
      label: t("1日の生成", "Per day"),
      value: t(`最大${premium.dailyImages}枚`, `Up to ${premium.dailyImages}`),
    },
    {
      icon: WalletIcon,
      label: t("月額", `Monthly (${toApproxUsdText(lite.price)})`),
      value: t(
        `¥${toMoneyNumberText(lite.price)}〜`,
        `From ¥${toMoneyNumberText(lite.price)}`,
      ),
    },
  ]

  return (
    // スマホでは短くして、すぐ下のプランの一覧が最初の画面に入るようにする
    <section className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-violet-500/15 via-fuchsia-500/5 to-sky-500/15 px-4 py-5 md:px-10 md:py-12">
      <div className="-top-24 -right-20 pointer-events-none absolute size-72 rounded-full bg-violet-500/25 blur-3xl" />
      <div className="-bottom-24 -left-16 pointer-events-none absolute size-72 rounded-full bg-sky-500/20 blur-3xl" />
      <div className="relative grid gap-4 md:gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <p className="inline-flex items-center gap-1 rounded-full border bg-background/70 px-3 py-1 font-bold text-xs backdrop-blur">
            <SparklesIcon className="size-3.5 text-violet-500" />
            {"Aipictors+"}
          </p>
          {(isTrial || isFirstMonthOffer) && (
            <p className="ml-2 inline-flex items-center rounded-full bg-fuchsia-600 px-3 py-1 font-bold text-white text-xs">
              {isTrial
                ? liteOffer.isGuest
                  ? t(
                      `はじめての方はライト${TRIAL_DAYS}日間無料`,
                      `New here? Try Lite free for ${TRIAL_DAYS} days`,
                    )
                  : t(
                      `ライトを${TRIAL_DAYS}日間無料でお試し`,
                      `Try Lite free for ${TRIAL_DAYS} days`,
                    )
                : t("初月半額キャンペーン中", "50% off your first month")}
            </p>
          )}
          <h1 className="mt-3 font-extrabold text-[26px] leading-tight tracking-tight md:mt-4 md:text-5xl">
            {t("1回のクリックで", "One click.")}
            <br />
            <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-sky-500 bg-clip-text text-transparent">
              {t("4枚まとめて生成。", "Four images.")}
            </span>
          </h1>
          <p className="mt-2 text-muted-foreground text-sm md:hidden">
            {t(
              `無料は1回1枚・1日${getPlanSpec("FREE").dailyImages}枚。プランなら1回${lite.imagesPerRequest}枚・1日最大${premium.dailyImages}枚、広告なし。`,
              `Free gives you 1 image per click, ${getPlanSpec("FREE").dailyImages} a day. Plans give you ${lite.imagesPerRequest} per click, up to ${premium.dailyImages} a day, with no ads.`,
            )}
          </p>
          <p className="mt-4 hidden max-w-2xl text-muted-foreground text-sm leading-relaxed md:block md:text-base">
            {t(
              `プランに加入すると、1回の生成で4枚（無料は1枚）。毎日のフリーコインも最大${premium.dailyFreeCoins}コインに増えて、1日最大${premium.dailyImages}枚まで生成できます。広告なしで、もっと気軽に創作を楽しめます。`,
              `On a plan, every click makes ${lite.imagesPerRequest} images instead of 1, and you can create up to ${premium.dailyImages} images a day. No ads, cancel anytime.`,
            )}
          </p>
          <div className="mt-6 hidden max-w-xl grid-cols-3 gap-2 md:grid">
            {points.map((point) => (
              <div
                key={point.label}
                className="rounded-2xl border bg-background/70 px-2 py-3 text-center backdrop-blur"
              >
                <point.icon className="mx-auto size-4 text-violet-500" />
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {point.label}
                </p>
                <p className="font-extrabold text-base md:text-xl">
                  {point.value}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row md:mt-6">
            <Button
              asChild
              size="lg"
              className={`${planCtaClassName} sm:w-auto`}
            >
              <a href="#plans">
                {isTrial
                  ? t(
                      `プランを選ぶ（ライトは${TRIAL_DAYS}日間無料）`,
                      `See plans — Lite is free for ${TRIAL_DAYS} days`,
                    )
                  : isFirstMonthOffer
                  ? t(
                      `プランを選ぶ（初月¥${toMoneyNumberText(toFirstMonthPrice(lite.price))}〜）`,
                      `See plans, from ¥${toMoneyNumberText(toFirstMonthPrice(lite.price))} for month one`,
                    )
                  : t("プランを選ぶ", "Choose a plan")}
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="hidden w-full rounded-xl bg-background/70 sm:w-auto md:inline-flex"
            >
              <Link to="/generation">
                {t("まずは無料で生成してみる", "Try it free first")}
              </Link>
            </Button>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-md lg:w-72">
          <div className="grid grid-cols-4 gap-1.5 rounded-2xl border bg-background/60 p-1.5 shadow-violet-500/10 shadow-xl backdrop-blur lg:grid-cols-2 lg:gap-2 lg:rounded-3xl lg:p-2">
            {sampleImages.map((src, index) => (
              <img
                key={src}
                src={src}
                alt={t(`生成例${index + 1}`, `Sample ${index + 1}`)}
                loading="lazy"
                className="aspect-square w-full rounded-xl object-cover lg:rounded-2xl"
              />
            ))}
          </div>
          <span className="-top-3 -right-3 absolute rounded-full bg-gradient-to-r from-violet-600 to-sky-500 px-3 py-1 font-extrabold text-sm text-white shadow-lg">
            {"×4"}
          </span>
        </div>
      </div>
    </section>
  )
}
