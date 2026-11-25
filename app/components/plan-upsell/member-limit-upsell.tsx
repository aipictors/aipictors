import { useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { ArrowLeft, Check, Coins, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import {
  type MemberPassType,
  useMemberPlanChange,
  useStandardUpgradeOffer,
} from "~/hooks/use-member-plan-change"
import { useTranslation } from "~/hooks/use-translation"
import { createPremiumCoinCheckoutUrl } from "~/lib/start-premium-coin-checkout"
import { cn } from "~/lib/utils"
import { getPlanSpec } from "~/routes/($lang)._main.plus._index/utils/plan-specs"
import { trackGrowthEvent } from "~/utils/track-growth-event"

type Props = {
  /** 加入中のプラン（LITE / STANDARD / PREMIUM） */
  passType: MemberPassType
  /** 計測用（どの画面から開いたか） */
  source: string
  /** 決済から戻る先 */
  returnPath?: string
}

const toYen = (value: number) => `¥${value.toLocaleString("ja-JP")}`

/** 「今日だけ +100 枚」に使うコインの枚数（通常の生成 1 枚 10 コイン × 100 枚） */
const EXTRA_DAY_COINS = 1000
const EXTRA_DAY_PRICE_YEN = 800

/**
 * 加入中の人が毎日の上限に当たったときの案内
 * - ライト → スタンダード（はじめて上げる人は初月 ¥980）
 * - スタンダード → プレミアム（1日200枚・保存2年・モデル登録 毎月150GB）
 * - プレミアム → 「今日だけ +100枚」のコイン購入（スタンダードにも小さく出す）
 * 上のプランは、新しく契約せずに今の契約を変える（差額はその日に精算。先に今日の請求額を見せる）
 */
export function MemberLimitUpsell(props: Props) {
  const t = useTranslation()

  // アプリのストア（App Store・Google Play）で入ったプランはここでは変えられないので /plus へ案内する
  const { data: passData } = useQuery(viewerPassProviderQuery)
  const provider = passData?.viewer?.currentPass?.paymentProvider ?? null
  const isManagedElsewhere =
    provider === "APP_STORE" || provider === "GOOGLE_PLAY"

  const change = useMemberPlanChange(props.passType)
  const offer = useStandardUpgradeOffer(props.passType === "LITE")
  const [isCoinLoading, setIsCoinLoading] = useState(false)

  const target: MemberPassType | null =
    props.passType === "LITE"
      ? "STANDARD"
      : props.passType === "STANDARD"
        ? "PREMIUM"
        : null

  useEffect(() => {
    trackGrowthEvent(
      target ? `member_upsell_view_${target}` : "member_extra_coins_view",
      props.source,
    )
    if (offer) trackGrowthEvent("standard_upgrade_offer_view", props.source)
  }, [offer !== null])

  const startExtraCoins = async () => {
    trackGrowthEvent("member_extra_coins_checkout", props.source)
    setIsCoinLoading(true)
    try {
      const url = await createPremiumCoinCheckoutUrl({
        coins: EXTRA_DAY_COINS,
        successPath: props.returnPath ?? "/generation",
        cancelPath: props.returnPath ?? "/generation",
      })
      window.location.assign(url)
    } catch (error) {
      toast(
        t(
          error instanceof Error
            ? error.message
            : "決済画面を開けませんでした。",
          "We couldn't open checkout. Please try again.",
        ),
      )
      setIsCoinLoading(false)
    }
  }

  const extraCoinsButton = (primary: boolean) => (
    <button
      type="button"
      disabled={isCoinLoading}
      onClick={() => void startExtraCoins()}
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-xl border p-3 text-left transition-colors hover:bg-muted/60 disabled:opacity-60",
        primary &&
          "border-2 border-amber-500/70 bg-gradient-to-br from-amber-500/10 to-orange-500/10",
      )}
    >
      <span className="flex items-start gap-2">
        <Coins className="mt-0.5 size-4 shrink-0 text-amber-500" />
        <span>
          <span className="block font-bold text-sm">
            {t("今日だけ +100枚", "+100 images, just for today")}
          </span>
          <span className="block text-muted-foreground text-xs">
            {t(
              `${EXTRA_DAY_COINS.toLocaleString("ja-JP")}コイン・会員はおまけ付き。余った分も3か月使えます`,
              `${EXTRA_DAY_COINS.toLocaleString("en-US")} coins, member bonus included. Leftovers last 3 months`,
            )}
          </span>
        </span>
      </span>
      <span className="shrink-0 text-right font-bold">
        {toYen(EXTRA_DAY_PRICE_YEN)}
        <span className="block font-normal text-[11px] text-fuchsia-600 dark:text-fuchsia-300">
          {isCoinLoading ? (
            <Loader2 className="ml-auto size-3 animate-spin" />
          ) : (
            t("買う →", "Buy →")
          )}
        </span>
      </span>
    </button>
  )

  if (target === null) {
    return <div className="space-y-2">{extraCoinsButton(true)}</div>
  }

  const current = getPlanSpec(props.passType)
  const next = getPlanSpec(target)

  // 今日の請求額の確認（押したらすぐ変わらないように）
  if (change.preview !== null) {
    return (
      <PlanChangeConfirm
        change={change}
        currentPassType={props.passType}
        source={props.source}
      />
    )
  }

  const benefits: [string, string][] =
    target === "STANDARD"
      ? [
          [
            `1日${next.dailyImages}枚（今の${next.dailyImages / current.dailyImages}倍）`,
            `${next.dailyImages} a day (${next.dailyImages / current.dailyImages}x now)`,
          ],
          ["生成がいちばん先", "First in the queue"],
          [
            `同時に${next.concurrentTasks}本・予約生成`,
            `${next.concurrentTasks} at once · queued runs`,
          ],
          ["Nano Banana 2・高速モード", "Nano Banana 2 · fast mode"],
        ]
      : [
          [
            `1日${next.dailyImages}枚（今の${next.dailyImages / current.dailyImages}倍）`,
            `${next.dailyImages} a day (${next.dailyImages / current.dailyImages}x now)`,
          ],
          ["生成画像の保存 2年（今は1年）", "Images kept 2 years (now 1)"],
          [
            `モデル登録 毎月${next.modelSlots}GB（今は${current.modelSlots}GB）`,
            `${next.modelSlots}GB of model uploads a month (now ${current.modelSlots}GB)`,
          ],
          [
            `同時に${next.concurrentTasks}本まで`,
            `Up to ${next.concurrentTasks} at once`,
          ],
        ]

  return (
    <div className="space-y-2">
      <div className="rounded-2xl border-2 border-violet-500 bg-gradient-to-br from-violet-500/10 to-sky-500/10 p-4 dark:border-violet-400">
        <div className="flex items-center justify-between gap-2">
          <p className="font-bold leading-tight">
            {t(`${next.name}なら`, `With ${next.enName}`)}
          </p>
          {offer && (
            <span className="whitespace-nowrap rounded-md bg-fuchsia-600 px-1.5 py-0.5 font-bold text-white text-xs">
              {t("ライトの方だけ", "Lite members only")}
            </span>
          )}
        </div>
        <ul className="mt-2 grid grid-cols-1 gap-y-1 text-sm">
          {benefits.map(([ja, en]) => (
            <li key={ja} className="flex items-start gap-1.5">
              <Check className="mt-0.5 size-3.5 shrink-0 text-violet-500" />
              <span>{t(ja, en)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 flex flex-wrap items-baseline gap-x-1.5">
          {offer ? (
            <>
              <span className="font-extrabold text-3xl text-fuchsia-600 leading-tight tracking-tight dark:text-fuchsia-300">
                {toYen(offer.firstMonthYen)}
              </span>
              <span className="text-muted-foreground text-sm line-through">
                {toYen(offer.regularYen)}
              </span>
              <span className="text-foreground/80 text-xs">
                {t(
                  `初月・2か月目から${toYen(offer.regularYen)}/月`,
                  `first month, then ${toYen(offer.regularYen)}/mo`,
                )}
              </span>
            </>
          ) : (
            <>
              <span className="font-extrabold text-2xl leading-tight tracking-tight">
                {toYen(next.price)}
              </span>
              <span className="text-foreground/80 text-xs">
                {t(
                  `/月（今は${toYen(current.price)}）`,
                  `/mo (now ${toYen(current.price)})`,
                )}
              </span>
            </>
          )}
        </p>
        <Button
          disabled={change.loading !== null}
          onClick={() => {
            trackGrowthEvent(`member_upsell_click_${target}`, props.source)
            if (isManagedElsewhere) {
              window.location.assign("/plus#plans")
              return
            }
            void change.loadPreview(target, props.source)
          }}
          className="mt-3 h-11 w-full rounded-xl bg-gradient-to-r from-violet-600 to-sky-500 font-bold text-white shadow-lg shadow-violet-500/25 hover:opacity-95 active:scale-[0.98] dark:text-white"
        >
          {change.loading === "preview" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : offer ? (
            t(
              `初月${toYen(offer.firstMonthYen)}で${next.name}にする`,
              `Switch to ${next.enName} for ${toYen(offer.firstMonthYen)}`,
            )
          ) : (
            t(`${next.name}にする`, `Switch to ${next.enName}`)
          )}
        </Button>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          {t(
            "次の画面で今日のお支払い額を確かめてから変更します",
            "You'll see today's charge before anything changes",
          )}
        </p>
      </div>
      {props.passType === "STANDARD" && extraCoinsButton(false)}
    </div>
  )
}

/**
 * 加入中の人のプラン変更の確認（今日の請求額と次からの金額を見せてから変える）
 */
export function PlanChangeConfirm(props: {
  change: ReturnType<typeof useMemberPlanChange>
  currentPassType: MemberPassType
  source: string
}) {
  const t = useTranslation()
  const change = props.change
  const preview = change.preview
  if (preview === null) return null
  const current = getPlanSpec(props.currentPassType)
  const next = getPlanSpec(preview.passType)
  return (
    <div className="space-y-3 rounded-2xl border-2 border-violet-500 p-4">
      <p className="font-bold">
        {t(`${next.name}プランに変更します`, `Switch to ${next.enName}`)}
      </p>
      <dl className="space-y-1 text-sm">
        <div className="flex justify-between gap-2">
          <dt className="text-muted-foreground">
            {t("今日のお支払い", "Charged today")}
          </dt>
          <dd className="font-bold">{toYen(preview.chargedNowAmountJpy)}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-muted-foreground">
            {preview.upgradeOffer
              ? t("1か月後から", "From next month")
              : t("次の更新から", "From your next renewal")}
          </dt>
          <dd>
            {toYen(preview.renewalAmountJpy ?? next.price)}
            {preview.interval === "year" ? t("/年", "/yr") : t("/月", "/mo")}
          </dd>
        </div>
      </dl>
      <p className="text-muted-foreground text-xs">
        {preview.upgradeOffer
          ? t(
              `初月${toYen(preview.upgradeOffer.firstMonthYen)}から、${current.name}の残りの日数分を差し引いています。今日から1か月が新しい期間になります。`,
              `${toYen(preview.upgradeOffer.firstMonthYen)} for the first month, minus the unused days of ${current.enName}. Your new month starts today.`,
            )
          : t(
              `今日の金額は、次の更新日までの差額です。${next.name}の特典はすぐ使えます。`,
              `Today's charge covers the difference until your next renewal. ${next.enName} perks start right away.`,
            )}
      </p>
      <Button
        disabled={change.loading !== null}
        onClick={() => void change.commit(props.source)}
        className="h-11 w-full rounded-xl bg-gradient-to-r from-violet-600 to-sky-500 font-bold text-white hover:opacity-95 dark:text-white"
      >
        {change.loading === "commit" ? (
          <Loader2 className="size-4 animate-spin" />
        ) : preview.chargedNowAmountJpy > 0 ? (
          t(
            `${toYen(preview.chargedNowAmountJpy)}を支払って変更する`,
            `Pay ${toYen(preview.chargedNowAmountJpy)} and switch`,
          )
        ) : (
          t("変更する", "Switch")
        )}
      </Button>
      <button
        type="button"
        onClick={change.reset}
        className="flex min-h-9 w-full items-center justify-center gap-1 text-muted-foreground text-sm hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        {t("戻る", "Back")}
      </button>
    </div>
  )
}

const viewerPassProviderQuery = graphql(
  `query ViewerPassProviderForUpsell {
    viewer {
      id
      currentPass {
        id
        paymentProvider
      }
    }
  }`,
)
