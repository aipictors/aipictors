import { Link } from "@remix-run/react"
import { CheckIcon, SparklesIcon } from "lucide-react"
import { LoginDialogButton } from "~/components/login-dialog-button"
import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import {
  getPlanSpec,
  type PlanKey,
} from "~/routes/($lang)._main.plus._index/utils/plan-specs"
import { toPassFeatures } from "~/routes/($lang)._main.plus._index/utils/to-pass-features"
import { toMoneyNumberText } from "~/utils/to-money-number-text"

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
  onClick(): Promise<void>
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

  return (
    <div
      className={cn(
        "relative flex h-full flex-col rounded-2xl border bg-card p-5 text-card-foreground shadow-sm",
        props.isPrimary &&
          "border-2 border-violet-500 shadow-violet-500/15 shadow-xl dark:border-violet-400",
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
      <p className="mt-3 flex items-baseline gap-1">
        <span className="font-extrabold text-3xl tracking-tight">
          {`¥${toMoneyNumberText(spec.price)}`}
        </span>
        <span className="text-muted-foreground text-xs">
          {isFree ? "" : t("/月（税込）", "/mo (tax incl.)")}
        </span>
      </p>
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
                "プランに登録するにはログインしてください。ログイン後、このページから登録できます。",
                "Please log in to subscribe. You can subscribe from this page after logging in.",
              )}
              triggerChildren={
                <Button className={planCtaClassName}>
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
                : t(`${spec.name}に登録する`, `Get ${spec.enName}`)}
            </Button>
          )}
        </div>
      )}
      <ul className="mt-4 space-y-2 text-sm">
        {!isFree && (
          <li className="flex items-start gap-2">
            <CheckIcon className="mt-0.5 size-4 shrink-0 text-violet-500" />
            <span>{t("広告の非表示・認証マーク", "Ad-free & verified badge")}</span>
          </li>
        )}
        {toPassFeatures(props.plan).map((feature) => (
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
