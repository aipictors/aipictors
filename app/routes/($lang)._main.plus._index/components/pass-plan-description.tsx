import { toApproxUsdText } from "~/utils/to-approx-usd-text"
import { Link } from "~/lib/app/locale-router"
import { CheckIcon, ChevronDownIcon, SparklesIcon } from "lucide-react"
import { useState } from "react"
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
import { toFirstMonthPrice, useFirstMonthOffer } from "~/hooks/use-first-month-offer"

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
  LITE: ["毎日気軽に生成したい方に", "For casual daily creators"],
  STANDARD: ["しっかり創作したい方に", "For serious creators"],
  PREMIUM: ["とにかくたくさん生成したい方に", "For heavy creators"],
} as const

export const planCtaClassName =
  "w-full rounded-xl bg-gradient-to-r from-violet-600 to-sky-500 font-bold text-white shadow-lg shadow-violet-500/25 transition-all duration-200 hover:-translate-y-0.5 hover:opacity-95 hover:shadow-violet-500/40 dark:text-white"

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
  const isFirstMonthOffer = useFirstMonthOffer() && !isYearly && !isFree
  const firstMonthPrice = toFirstMonthPrice(spec.price)
  // スマホ（1 列）では特典の一覧をたたんで、3 つのプランと登録ボタンがすぐ見えるようにする
  const [isFeatureOpen, setIsFeatureOpen] = useState(false)

  return (
    <div
      className={cn(
        "relative flex h-full flex-col rounded-2xl border bg-card p-5 text-card-foreground shadow-sm",
        props.isPrimary &&
          "border-2 border-violet-500 shadow-violet-500/15 shadow-xl dark:border-violet-400",
        props.className,
      )}
    >
      {props.isPrimary && (
        <span className="-top-3 -translate-x-1/2 absolute left-1/2 inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-gradient-to-r from-violet-600 to-sky-500 px-3 py-1 font-bold text-white text-xs shadow">
          <SparklesIcon className="size-3" />
          {t("おすすめ", "Recommended")}
        </span>
      )}
      <p className="font-bold text-lg">{t(spec.name, spec.enName)}</p>
      <p className="text-muted-foreground text-xs">
        {t(tagline[props.plan][0], tagline[props.plan][1])}
      </p>
      {isYearly ? (
        <>
          <p className="mt-3 flex items-baseline gap-1">
            <span className="font-extrabold text-3xl tracking-tight">
              {`¥${toMoneyNumberText(spec.yearlyPrice)}`}
            </span>
            <span className="text-muted-foreground text-xs">
              {t("/年（税込）", "/yr (tax incl.)")}
            </span>
          </p>
          <p className="mt-1 inline-flex w-fit items-center rounded-full bg-fuchsia-600/10 px-2 py-0.5 font-bold text-fuchsia-700 text-xs dark:text-fuchsia-300">
            {t(
              `月¥${toMoneyNumberText(Math.round(spec.yearlyPrice / 12))}・¥${toMoneyNumberText(spec.price * 12 - spec.yearlyPrice)}おトク`,
              `¥${toMoneyNumberText(Math.round(spec.yearlyPrice / 12))}/mo · save ¥${toMoneyNumberText(spec.price * 12 - spec.yearlyPrice)}`,
            )}
          </p>
        </>
      ) : isFirstMonthOffer ? (
        // 初月の金額と 2 か月目からの金額を並べて書く（半額は初月だけ）
        <>
          <p className="mt-3 flex items-baseline gap-1.5">
            <span className="rounded-md bg-fuchsia-600 px-1.5 py-0.5 font-bold text-white text-xs">
              {t("初月半額", "50% off 1st month")}
            </span>
            <span className="font-extrabold text-3xl text-fuchsia-600 tracking-tight dark:text-fuchsia-300">
              {`¥${toMoneyNumberText(firstMonthPrice)}`}
            </span>
            <span className="text-muted-foreground text-sm line-through">
              {`¥${toMoneyNumberText(spec.price)}`}
            </span>
          </p>
          <p className="mt-1 text-muted-foreground text-xs">
            {t(
              `2か月目から ¥${toMoneyNumberText(spec.price)}/月（税込）`,
              `Then ¥${toMoneyNumberText(spec.price)}/mo (tax incl., ${toApproxUsdText(spec.price)}, billed in JPY)`,
            )}
          </p>
        </>
      ) : (
        <>
          <p className="mt-3 flex items-baseline gap-1">
            <span className="font-extrabold text-3xl tracking-tight">
              {`¥${toMoneyNumberText(spec.price)}`}
            </span>
            <span className="text-muted-foreground text-xs">
              {isFree ? "" : t("/月（税込）", "/mo (tax incl.)")}
            </span>
          </p>
          {!isFree && t.isEnglish && (
            <p className="mt-0.5 text-muted-foreground text-xs">
              {`${toApproxUsdText(spec.price)}/mo, billed in JPY`}
            </p>
          )}
        </>
      )}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div
          className={cn(
            "rounded-xl bg-muted/60 px-2 py-3 text-center",
            !isFree &&
              "bg-gradient-to-br from-violet-500/15 to-sky-500/15 dark:from-violet-500/25 dark:to-sky-500/20",
          )}
        >
          <p className="text-[11px] text-muted-foreground">
            {t("1回の生成", "Per request")}
          </p>
          <p className="font-extrabold text-2xl">
            {spec.imagesPerRequest}
            <span className="ml-0.5 font-bold text-sm">{t("枚", "")}</span>
          </p>
        </div>
        <div className="rounded-xl bg-muted/60 px-2 py-3 text-center">
          <p className="text-[11px] text-muted-foreground">
            {t("1日の生成", "Per day")}
          </p>
          <p className="font-extrabold text-2xl">
            {spec.dailyImages}
            <span className="ml-0.5 font-bold text-sm">{t("枚", "")}</span>
          </p>
        </div>
      </div>
      {isButtonVisible && (
        <div className="mt-4">
          {isFree ? (
            <Button asChild variant="outline" className="w-full rounded-xl">
              <Link to="/generation">
                {t("無料で生成してみる", "Try for free")}
              </Link>
            </Button>
          ) : props.isCurrent ? (
            <Button className="w-full rounded-xl" disabled={true}>
              {t("加入中", "Subscribed")}
            </Button>
          ) : props.isLoggedOut ? (
            <LoginDialogButton
              description={t(
                `ログインすると、そのまま${spec.name}の決済画面へ進みます。`,
                `After you log in, you'll go straight to checkout for ${spec.enName}.`,
              )}
              triggerChildren={
                <Button
                  className={planCtaClassName}
                  onClick={() => props.onLoginClick?.()}
                >
                  {t("ログインして登録する", "Log in to subscribe")}
                </Button>
              }
            />
          ) : (
            <Button
              className={planCtaClassName}
              disabled={props.isDisabled ?? props.isLoading}
              onClick={props.onClick}
            >
              {props.isDisabled
                ? t("準備中", "Coming Soon")
                : isYearly
                  ? t(`${spec.name}を年払いで登録する`, `Get ${spec.enName} yearly`)
                  : isFirstMonthOffer
                    ? t(
                        `初月¥${toMoneyNumberText(firstMonthPrice)}で${spec.name}をはじめる`,
                        `Start ${spec.enName} for ¥${toMoneyNumberText(firstMonthPrice)}`,
                      )
                    : t(`${spec.name}に登録する`, `Get ${spec.enName}`)}
            </Button>
          )}
          {!isFree && !props.isCurrent && (
            <p className="mt-2 flex items-start justify-center gap-1 text-muted-foreground text-xs">
              <CheckIcon className="mt-0.5 size-3 shrink-0 text-violet-500" />
              {isYearly
                ? t(
                    "解約すると次の更新日（1年後）まで使えます",
                    "Cancel anytime; benefits last until the yearly renewal date",
                  )
                : t(
                    "いつでも解約できます（更新日まで使えます）",
                    "Cancel anytime (benefits last until the renewal date)",
                  )}
            </p>
          )}
        </div>
      )}
      <button
        type="button"
        aria-expanded={isFeatureOpen}
        onClick={() => setIsFeatureOpen((prev) => !prev)}
        className="@xl:hidden mt-3 flex w-full items-center justify-center gap-1 rounded-lg py-1.5 text-muted-foreground text-xs hover:text-foreground"
      >
        {isFeatureOpen
          ? t("特典をたたむ", "Hide benefits")
          : t("特典をすべて見る", "See all benefits")}
        <ChevronDownIcon
          className={cn("size-4 transition-transform", isFeatureOpen && "rotate-180")}
        />
      </button>
      <ul
        className={cn(
          "mt-2 @xl:mt-4 space-y-2 text-sm",
          !isFeatureOpen && "@xl:block hidden",
        )}
      >
        {!isFree && (
          <li className="flex items-start gap-2">
            <CheckIcon className="mt-0.5 size-4 shrink-0 text-violet-500" />
            <span>{t("広告の非表示・認証マーク", "Ad-free & verified badge")}</span>
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
