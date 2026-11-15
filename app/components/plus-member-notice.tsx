import { useLocation } from "@remix-run/react"
import { CheckIcon, Loader2, SparklesIcon, XIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import {
  clearSubscriptionSummaryCache,
  useSubscriptionSummary,
} from "~/hooks/use-subscription-summary"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { cn } from "~/lib/utils"
import { postAsViewer } from "~/lib/viewer-request-headers"
import {
  type PlanKey,
  getPlanSpec,
} from "~/routes/($lang)._main.plus._index/utils/plan-specs"
import { buildLocalePath } from "~/utils/locale-path"
import { toTrialDateText } from "~/utils/to-trial-date-text"
import {
  trackGrowthEvent,
  trackGrowthEventOnce,
} from "~/utils/track-growth-event"

const DAY = 24 * 60 * 60

/** 終わる日がこの日数より先のときは、まだ知らせない（年払いの人に何か月も出さない） */
const ENDING_NOTICE_DAYS = 14

/** 閉じたら、この日数は出さない */
const ENDING_DISMISS_DAYS = 3

const ENDING_DISMISSED_KEY = "aipictors-plan-ending-dismissed-until"

/** 入ってからこの日数は、使い方の案内を出す */
const NEW_MEMBER_DAYS = 7

const GUIDE_DISMISSED_KEY = "aipictors-new-member-guide-dismissed"

/**
 * 重ねて出す案内を出さないページ（プランのページ自身、入力中・手続き中のページ、生成画面は画面内に出す）
 */
const FLOATING_HIDDEN_PATH_PATTERN =
  /^\/(?:r\/)?(?:plus|new|settings|support|contact|generation|admin|app|pictor-chan\/run)(?:\/|$)/

const isPlanKey = (type: string | null): type is Exclude<PlanKey, "FREE"> =>
  type === "LITE" || type === "STANDARD" || type === "PREMIUM"

const readNumber = (key: string) => {
  try {
    return Number(window.localStorage.getItem(key) ?? 0)
  } catch (_error) {
    return 0
  }
}

const write = (key: string, value: string) => {
  try {
    window.localStorage.setItem(key, value)
  } catch (_error) {
    // 保存できなくても、この画面では閉じたままにする
  }
}

type EndingProps = {
  /**
   * banner: 画面の中に置く（生成画面） / floating: 画面の下に重ねて出す（どのページでも）
   */
  variant: "banner" | "floating"
}

/**
 * 解約を予約した人に、終わる日が近づいたら「続けるなら取り消せます」と知らせる
 * 加入 1 か月以内に解約予約だけして使い続けている人が多く（解約予約 15 件中 13 件）、
 * 取り消しはプランのページの奥にしかなかったので、使っている画面からそのまま取り消せるようにする
 */
export function PlanEndingNotice(props: EndingProps) {
  const t = useTranslation()
  const { pathname } = useLocation()
  const isHiddenPath =
    props.variant === "floating" &&
    FLOATING_HIDDEN_PATH_PATTERN.test(buildLocalePath("ja", pathname))
  const summary = useSubscriptionSummary(!isHiddenPath)
  const [isClosed, setIsClosed] = useState(true)
  const [isConfirming, setIsConfirming] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const now = Date.now() / 1000
  const periodEnd = summary?.currentPeriodEnd ?? null
  const isEnding =
    summary?.status === "cancellation_requested" &&
    isPlanKey(summary.type) &&
    periodEnd !== null &&
    periodEnd > now &&
    periodEnd - now < ENDING_NOTICE_DAYS * DAY

  useEffect(() => {
    if (!isEnding) return
    setIsClosed(readNumber(ENDING_DISMISSED_KEY) > Date.now())
  }, [isEnding])

  const isVisible = isEnding && !isClosed && !isHiddenPath

  useEffect(() => {
    if (isVisible) trackGrowthEventOnce("ending_view", props.variant)
  }, [isVisible])

  if (!isVisible || summary === null || periodEnd === null) return null
  if (!isPlanKey(summary.type)) return null

  const spec = getPlanSpec(summary.type)
  const date = toTrialDateText(periodEnd, t.isEnglish)
  const daysLeft = Math.max(1, Math.ceil((periodEnd - now) / DAY))

  const onDismiss = () => {
    write(
      ENDING_DISMISSED_KEY,
      String(Date.now() + ENDING_DISMISS_DAYS * DAY * 1000),
    )
    setIsClosed(true)
    trackGrowthEvent("ending_dismiss", props.variant)
  }

  const onKeep = async () => {
    setIsSubmitting(true)
    try {
      const response = await postAsViewer("/api/stripe/subscription-resume", {})
      const json = (await response.json().catch(() => null)) as {
        error?: string | null
      } | null
      if (!response.ok || json?.error) {
        toast(
          t(
            "解約の取り消しに失敗しました。プランのページからお試しください。",
            "We couldn't undo the cancellation. Please try from the plans page.",
          ),
        )
        return
      }
      clearSubscriptionSummaryCache()
      trackGrowthEvent("ending_keep", props.variant)
      setIsClosed(true)
      toast(
        t(
          `解約を取り消しました。${spec.name}プランを引き続きご利用いただけます。`,
          `Cancellation undone. Your ${spec.enName} plan continues.`,
        ),
      )
    } catch (_error) {
      toast(
        t(
          "解約の取り消しに失敗しました。プランのページからお試しください。",
          "We couldn't undo the cancellation. Please try from the plans page.",
        ),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const body = (
    <div className="relative rounded-xl border border-amber-500/40 bg-amber-50 p-3 pr-9 text-sm shadow-sm dark:bg-amber-950/60">
      <p className="font-bold">
        {t(
          `${spec.name}プランは ${date} に終了します（あと${daysLeft}日）`,
          `Your ${spec.enName} plan ends on ${date} (${daysLeft} day${daysLeft === 1 ? "" : "s"} left)`,
        )}
      </p>
      <p className="mt-0.5 text-muted-foreground text-xs">
        {t(
          `終了後は 1回${spec.imagesPerRequest}枚・1日${spec.dailyImages}枚の生成と広告なしが使えなくなります。続ける場合は、解約を取り消せます。`,
          `After that you lose ${spec.imagesPerRequest} images per click, ${spec.dailyImages} images a day and ad-free browsing. You can undo the cancellation to keep them.`,
        )}
      </p>
      {isConfirming ? (
        <div className="mt-2 space-y-2">
          <p className="text-xs">
            {t(
              `解約を取り消します。${date} に、通常の料金で自動更新されます。`,
              `We'll undo the cancellation. Your plan renews at the regular price on ${date}.`,
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              disabled={isSubmitting}
              onClick={onKeep}
              className="h-9 rounded-lg bg-green-600 font-bold text-white hover:bg-green-700 dark:bg-green-600 dark:text-white dark:hover:bg-green-700"
            >
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              {t("取り消して続ける", "Undo and keep my plan")}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={isSubmitting}
              onClick={() => setIsConfirming(false)}
              className="h-9 rounded-lg"
            >
              {t("やめる", "Never mind")}
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
          <Button
            size="sm"
            onClick={() => {
              trackGrowthEvent("ending_click", props.variant)
              setIsConfirming(true)
            }}
            className="h-9 rounded-lg bg-green-600 font-bold text-white hover:bg-green-700 dark:bg-green-600 dark:text-white dark:hover:bg-green-700"
          >
            {t("このまま続ける", "Keep my plan")}
          </Button>
          <Link
            to="/plus"
            onClick={() => trackGrowthEvent("ending_plans", props.variant)}
            className="inline-flex min-h-9 items-center text-muted-foreground text-xs underline-offset-4 hover:text-foreground hover:underline"
          >
            {t("1か月休む・プランを変える", "Pause for a month or change plan")}
          </Link>
        </div>
      )}
      <button
        type="button"
        aria-label={t("この案内を閉じる", "Dismiss this message")}
        onClick={onDismiss}
        className="absolute top-1 right-1 flex size-9 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
      >
        <XIcon className="size-4" />
      </button>
    </div>
  )

  if (props.variant === "banner")
    return <div className="mx-2 md:mx-0">{body}</div>

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(var(--aip-tabbar-h,3.75rem)+0.75rem)] z-40 flex justify-center px-3 md:inset-x-auto md:right-4 md:bottom-4 md:px-0">
      <div className="pointer-events-auto w-full max-w-sm">{body}</div>
    </div>
  )
}

/**
 * 入ったばかりの人に、プランで変わったことと最初にやることを生成画面で知らせる
 * 加入 1 か月で解約する人は最初の 30 日の生成が中央値 9.5 枚（続いている人は 80 枚）で、
 * 入った直後に使い方が分からないまま終わっているので、使う画面で伝える
 */
export function NewMemberGuide(props: { className?: string }) {
  const t = useTranslation()
  const summary = useSubscriptionSummary()
  const [isClosed, setIsClosed] = useState(true)

  const now = Date.now() / 1000
  const createdAt = summary?.createdAt ?? null
  const isNew =
    summary !== null &&
    isPlanKey(summary.type) &&
    summary.status !== "cancellation_requested" &&
    createdAt !== null &&
    now - createdAt < NEW_MEMBER_DAYS * DAY

  useEffect(() => {
    if (!isNew || createdAt === null) return
    // 入り直した人には、もう一度出す
    setIsClosed(readNumber(GUIDE_DISMISSED_KEY) >= createdAt)
  }, [isNew, createdAt])

  const isVisible = isNew && !isClosed

  useEffect(() => {
    if (isVisible)
      trackGrowthEventOnce("member_guide_view", summary?.type ?? "")
  }, [isVisible])

  if (!isVisible || summary === null || !isPlanKey(summary.type)) return null

  const spec = getPlanSpec(summary.type)

  const items = [
    t(
      `同時生成枚数を${spec.imagesPerRequest}枚にすると、1回で${spec.imagesPerRequest}枚まとめて作れます`,
      `Set images per click to ${spec.imagesPerRequest} to make ${spec.imagesPerRequest} at once`,
    ),
    t(
      `毎日 ${spec.dailyFreeCoins.toLocaleString()} コイン（${spec.dailyImages}枚分）が届きます。使わなかった分は翌日に持ち越せません`,
      `You get ${spec.dailyFreeCoins.toLocaleString()} coins (${spec.dailyImages} images) every day. Unused daily coins don't carry over`,
    ),
    spec.fastMode
      ? t(
          "高速生成モードと予約生成が使えます。順番も優先されます",
          "Fast mode and scheduled generation are unlocked, with queue priority",
        )
      : t(
          "画像から生成（i2i）と Nano Banana が使えます。無料の人より先に生成されます",
          "Image-to-image and Nano Banana are unlocked, and you're ahead of free users in the queue",
        ),
  ]

  return (
    <div
      className={cn(
        "relative mx-2 rounded-xl border border-violet-500/30 bg-gradient-to-r from-violet-500/10 to-sky-500/10 p-3 pr-9 text-sm md:mx-0",
        props.className,
      )}
    >
      <p className="flex items-center gap-1.5 font-bold">
        <SparklesIcon className="size-4 text-violet-500" />
        {t(
          `${spec.name}プランが使えます。まずはここから`,
          `Your ${spec.enName} plan is active — start here`,
        )}
      </p>
      <ul className="mt-1.5 space-y-1 text-xs">
        {items.map((text) => (
          <li key={text} className="flex items-start gap-1.5">
            <CheckIcon className="mt-0.5 size-3.5 shrink-0 text-violet-500" />
            <span>{text}</span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        aria-label={t("この案内を閉じる", "Dismiss this message")}
        onClick={() => {
          write(GUIDE_DISMISSED_KEY, String(Math.ceil(Date.now() / 1000)))
          setIsClosed(true)
          trackGrowthEvent("member_guide_dismiss", summary.type ?? "")
        }}
        className="absolute top-1 right-1 flex size-9 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
      >
        <XIcon className="size-4" />
      </button>
    </div>
  )
}
