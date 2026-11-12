import { toApproxUsdText } from "~/utils/to-approx-usd-text"
import { Link } from "~/lib/app/locale-router"
import { CheckIcon, ChevronDownIcon, Loader2Icon, SparklesIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { LoginDialogButton } from "~/components/login-dialog-button"
import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import {
  type BillingInterval,
  getPlanSpec,
  type PlanKey,
} from "~/routes/($lang)._main.plus._index/utils/plan-specs"
import { toPassFeatures } from "~/routes/($lang)._main.plus._index/utils/to-pass-features"
import { toMoneyNumberText } from "~/utils/to-money-number-text"
import { TrialTerms } from "~/components/trial-terms"
import { toFirstMonthPrice, useFirstMonthOffer } from "~/hooks/use-first-month-offer"
import { TRIAL_DAYS, useLiteOffer } from "~/hooks/use-lite-offer"

type Props = {
  plan: PlanKey
  isPrimary?: boolean
  isDisabled?: boolean
  isCurrent?: boolean
  isHide?: boolean
  /**
   * 未ログインのときはログインしてから登録してもらう
   */
  isLoggedOut?: boolean
  isLoading: boolean
  /**
   * 年払いの料金を出す（省略時は月払い）
   */
  interval?: BillingInterval
  className?: string
  onClick(): Promise<void>
  /**
   * 未ログインの人が登録ボタン（ログイン）を押したとき
   */
  onLoginClick?(): void
}

const tagline = {
  FREE: ["まずはお試し", "Try it out"],
  LITE: ["毎日気軽に生成したい方に", "For everyday creating"],
  STANDARD: ["しっかり創作したい方に", "For regular creators"],
  PREMIUM: ["とにかくたくさん生成したい方に", "For high-volume creators"],
} as const

export const planCtaClassName =
  "h-11 w-full rounded-xl bg-gradient-to-r from-violet-600 to-sky-500 font-bold text-white shadow-lg shadow-violet-500/25 transition-all duration-200 hover:opacity-95 hover:shadow-violet-500/40 active:scale-[0.98] motion-safe:hover:-translate-y-0.5 motion-reduce:transition-none dark:text-white"

/**
 * プランのカード
 */
export function PassPlanDescription(props: Props) {
  const t = useTranslation()
  const spec = getPlanSpec(props.plan)
  const isFree = props.plan === "FREE"
  const isButtonVisible = props.isHide !== true
  const isYearly = props.interval === "year" && !isFree
  // 初月半額は月払いだけ（年払いはクーポンを付けない）
  // ライトの月払いは、はじめての人には 7 日間無料お試し、以前入っていた人には初月半額
  const liteOffer = useLiteOffer()
  const isLiteMonthly = props.plan === "LITE" && !isYearly
  const isTrialOffer =
    isLiteMonthly && liteOffer.offer === "trial" && props.isCurrent !== true
  // 確認中は、お試しとも半額とも書かない（後から切り替わってちらつかないように）
  const isOfferUnknown = isLiteMonthly && liteOffer.offer === "unknown"
  const isFirstMonthOffer =
    useFirstMonthOffer() &&
    !isYearly &&
    !isFree &&
    !isTrialOffer &&
    !isOfferUnknown
  const firstMonthPrice = toFirstMonthPrice(spec.price)
  // スマホ（1 列）では特典の一覧をたたんで、3 つのプランと登録ボタンがすぐ見えるようにする
  const [isFeatureOpen, setIsFeatureOpen] = useState(false)

  // 押したボタンだけ読み込み中の表示にする（決済画面へ移るまで 1〜2 秒かかる）
  const [isPending, setIsPending] = useState(false)

  useEffect(() => {
    if (!props.isLoading) setIsPending(false)
  }, [props.isLoading])

  const priceNote = "mt-1 text-muted-foreground text-xs leading-relaxed"

  return (
    <div
      className={cn(
        "relative flex h-full flex-col rounded-2xl border bg-card p-5 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md motion-reduce:transition-none",
        props.isPrimary &&
          "border-2 border-violet-500 shadow-lg shadow-violet-500/15 hover:shadow-violet-500/25 hover:shadow-xl dark:border-violet-400",
        props.className,
      )}
    >
      {props.isPrimary && (
        <span className="-top-3 -translate-x-1/2 absolute left-1/2 inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-gradient-to-r from-violet-600 to-sky-500 px-3 py-1 font-bold text-white text-xs shadow">
          <SparklesIcon className="size-3" />
          {t("おすすめ", "Recommended")}
        </span>
      )}
      <p className="font-bold text-lg leading-tight">
        {t(spec.name, spec.enName)}
      </p>
      <p className="mt-0.5 text-muted-foreground text-xs">
        {t(tagline[props.plan][0], tagline[props.plan][1])}
      </p>
      {/* 横に並ぶとき（PC）は、どのカードも金額の欄を同じ高さにして、下の枚数とボタンの位置をそろえる */}
      <div className="mt-3 flex @xl:min-h-[5.75rem] flex-col justify-end">
        {isYearly ? (
          <>
            <p>
              <span className="inline-block whitespace-nowrap rounded-md bg-fuchsia-600/10 px-1.5 py-0.5 font-bold text-fuchsia-700 text-xs dark:text-fuchsia-300">
                {t(
                  `¥${toMoneyNumberText(spec.price * 12 - spec.yearlyPrice)}おトク`,
                  `Save ¥${toMoneyNumberText(spec.price * 12 - spec.yearlyPrice)}`,
                )}
              </span>
            </p>
            <p className="mt-1 flex flex-wrap items-baseline gap-x-1">
              <span className="font-extrabold text-3xl tracking-tight">
                {`¥${toMoneyNumberText(spec.yearlyPrice)}`}
              </span>
              <span className="text-muted-foreground text-xs">
                {t("/年（税込）", "/year")}
              </span>
            </p>
            <p className={priceNote}>
              {t(
                `1か月あたり ¥${toMoneyNumberText(Math.round(spec.yearlyPrice / 12))}`,
                `¥${toMoneyNumberText(Math.round(spec.yearlyPrice / 12))}/mo · ${toApproxUsdText(spec.yearlyPrice)}/year`,
              )}
            </p>
          </>
        ) : isTrialOffer ? (
          // 無料の期間と、その後の金額を並べて書く
          <>
            <p>
              <span className="inline-block whitespace-nowrap rounded-md bg-fuchsia-600 px-1.5 py-0.5 font-bold text-white text-xs">
                {liteOffer.isGuest
                  ? t("はじめての方は", "New here?")
                  : t("無料お試し", "Free trial")}
              </span>
            </p>
            <p className="mt-1 flex flex-wrap items-baseline gap-x-1.5">
              <span className="font-extrabold text-3xl text-fuchsia-600 tracking-tight dark:text-fuchsia-300">
                {t(`${TRIAL_DAYS}日間無料`, `${TRIAL_DAYS} days free`)}
              </span>
            </p>
            <p className={cn(priceNote, "text-foreground/80")}>
              {t(
                `その後 ¥${toMoneyNumberText(spec.price)}/月（税込）`,
                `then ¥${toMoneyNumberText(spec.price)}/mo (${toApproxUsdText(spec.price)})`,
              )}
            </p>
          </>
        ) : isFirstMonthOffer ? (
          // 初月の金額と 2 か月目からの金額を並べて書く（半額は初月だけ）
          <>
            {/* PC の 4 列ではカードが狭いので、印は金額の上の行に置く（横に並べると印が折り返す） */}
            <p>
              <span className="inline-block whitespace-nowrap rounded-md bg-fuchsia-600 px-1.5 py-0.5 font-bold text-white text-xs">
                {t("初月半額", "50% off first month")}
              </span>
            </p>
            <p className="mt-1 flex flex-wrap items-baseline gap-x-1.5">
              <span className="font-extrabold text-3xl text-fuchsia-600 tracking-tight dark:text-fuchsia-300">
                {`¥${toMoneyNumberText(firstMonthPrice)}`}
              </span>
              <span className="text-muted-foreground text-sm line-through">
                {`¥${toMoneyNumberText(spec.price)}`}
              </span>
            </p>
            <p className={priceNote}>
              {t(
                `2か月目から ¥${toMoneyNumberText(spec.price)}/月（税込）`,
                `then ¥${toMoneyNumberText(spec.price)}/mo (${toApproxUsdText(spec.price)})`,
              )}
            </p>
          </>
        ) : (
          <>
            <p className="flex flex-wrap items-baseline gap-x-1">
              <span className="font-extrabold text-3xl tracking-tight">
                {`¥${toMoneyNumberText(spec.price)}`}
              </span>
              <span className="text-muted-foreground text-xs">
                {isFree ? "" : t("/月（税込）", "/mo")}
              </span>
            </p>
            <p className={priceNote}>
              {isFree
                ? t("ずっと無料", "Free forever, no card needed")
                : t("毎月自動で更新", `${toApproxUsdText(spec.price)}/mo`)}
            </p>
          </>
        )}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div
          className={cn(
            "rounded-xl bg-muted/60 px-2 py-3 text-center",
            !isFree &&
              "bg-gradient-to-br from-violet-500/15 to-sky-500/15 dark:from-violet-500/25 dark:to-sky-500/20",
          )}
        >
          <p className="text-[11px] text-muted-foreground">
            {t("1回の生成", "Per click")}
          </p>
          <p className="font-extrabold text-2xl tabular-nums">
            {spec.imagesPerRequest}
            <span className="ml-0.5 font-bold text-sm">
              {t("枚", spec.imagesPerRequest === 1 ? " image" : " images")}
            </span>
          </p>
        </div>
        <div className="rounded-xl bg-muted/60 px-2 py-3 text-center">
          <p className="text-[11px] text-muted-foreground">
            {t("1日の生成", "Per day")}
          </p>
          <p className="font-extrabold text-2xl tabular-nums">
            {spec.dailyImages}
            <span className="ml-0.5 font-bold text-sm">{t("枚", "")}</span>
          </p>
        </div>
      </div>
      {isButtonVisible && (
        <div className="mt-4">
          {isFree ? (
            <Button asChild variant="outline" className="h-11 w-full rounded-xl">
              <Link to="/generation">
                {t("無料で生成してみる", "Start for free")}
              </Link>
            </Button>
          ) : props.isCurrent ? (
            <Button className="h-11 w-full rounded-xl" disabled={true}>
              {t("加入中", "Your current plan")}
            </Button>
          ) : props.isLoggedOut ? (
            <LoginDialogButton
              description={t(
                isTrialOffer
                  ? `ログインすると、そのまま${spec.name}の無料お試しの手続きへ進みます（以前プランに入っていた方は初月半額になります）。`
                  : `ログインすると、そのまま${spec.name}の決済画面へ進みます。`,
                isTrialOffer
                  ? `Log in or create a free account, and we'll take you straight to your ${spec.enName} free trial. (If you've had a plan before, you'll get 50% off the first month instead.)`
                  : `Log in or create a free account, and we'll take you straight to checkout for ${spec.enName}.`,
              )}
              triggerChildren={
                <Button
                  className={planCtaClassName}
                  onClick={() => props.onLoginClick?.()}
                >
                  {isTrialOffer
                    ? t(
                        `${TRIAL_DAYS}日間無料で試す`,
                        `Start ${TRIAL_DAYS}-day free trial`,
                      )
                    : t("ログインして登録する", `Get ${spec.enName}`)}
                </Button>
              }
            />
          ) : (
            <Button
              className={planCtaClassName}
              disabled={props.isDisabled ?? props.isLoading}
              onClick={() => {
                setIsPending(true)
                void props.onClick()
              }}
            >
              {isPending && props.isLoading ? (
                <>
                  <Loader2Icon className="size-4 animate-spin" />
                  {t("決済画面へ移動中…", "Opening checkout…")}
                </>
              ) : props.isDisabled ? (
                t("準備中", "Coming soon")
              ) : isYearly ? (
                t("年払いで登録する", `Get ${spec.enName} yearly`)
              ) : isTrialOffer ? (
                t(
                  `${TRIAL_DAYS}日間無料で試す`,
                  `Start ${TRIAL_DAYS}-day free trial`,
                )
              ) : isFirstMonthOffer ? (
                t(
                  // PC の 4 列ではボタンが狭いので、プラン名は入れない（カードの見出しにある）
                  `初月¥${toMoneyNumberText(firstMonthPrice)}ではじめる`,
                  `Start for ¥${toMoneyNumberText(firstMonthPrice)}`,
                )
              ) : (
                t(`${spec.name}に登録する`, `Get ${spec.enName}`)
              )}
            </Button>
          )}
          {isTrialOffer ? (
            <TrialTerms isGuest={liteOffer.isGuest} className="mt-2" />
          ) : (
            !isFree &&
            !props.isCurrent && (
              <p className="mt-2 text-center text-[11px] text-muted-foreground">
                {t("いつでも解約できます", "Cancel anytime")}
              </p>
            )
          )}
        </div>
      )}
      <button
        type="button"
        aria-expanded={isFeatureOpen}
        onClick={() => setIsFeatureOpen((prev) => !prev)}
        className="@xl:hidden -mb-2 mt-2 flex h-11 w-full items-center justify-center gap-1 rounded-lg text-muted-foreground text-xs hover:text-foreground"
      >
        {isFeatureOpen
          ? t("特典をたたむ", "Hide what's included")
          : t("特典をすべて見る", "See what's included")}
        <ChevronDownIcon
          className={cn(
            "size-4 transition-transform motion-reduce:transition-none",
            isFeatureOpen && "rotate-180",
          )}
        />
      </button>
      <ul
        className={cn(
          "@xl:mt-5 mt-3 space-y-2 @xl:border-t @xl:pt-4 text-sm",
          !isFeatureOpen && "@xl:block hidden",
          isFeatureOpen && "motion-safe:animate-[fade-in-up_0.25s_ease-out_both]",
        )}
      >
        {!isFree && (
          <li className="flex items-start gap-2">
            <CheckIcon className="mt-0.5 size-4 shrink-0 text-violet-500" />
            <span>{t("広告の非表示・認証マーク", "No ads, plus a verified badge")}</span>
          </li>
        )}
        {toPassFeatures(props.plan, t).map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <CheckIcon
              className={cn(
                "mt-0.5 size-4 shrink-0",
                isFree ? "text-muted-foreground" : "text-violet-500",
              )}
            />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
