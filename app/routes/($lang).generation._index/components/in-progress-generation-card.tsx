import { Link } from "~/lib/app/locale-router"
import { SparklesIcon, ZapIcon } from "lucide-react"
import { useContext, useEffect } from "react"
import { TRIAL_DAYS, useLiteOffer } from "~/hooks/use-lite-offer"
import { useTranslation } from "~/hooks/use-translation"
import {
  trackGrowthEvent,
  trackGrowthEventOnce,
} from "~/utils/track-growth-event"
import { GenerationTaskCancelButton } from "~/routes/($lang).generation._index/components/generation-cancel-button"
import { GenerationQueryContext } from "~/routes/($lang).generation._index/contexts/generation-query-context"
import { useGenerationProgress } from "~/routes/($lang).generation._index/hooks/use-generation-progress"
import { cn } from "~/lib/utils"

type Props = {
  onCancel?(): void
  isCreatingTasks?: boolean
  isCanceling?: boolean
  inProgressNormalCount: number
  initImageGenerationWaitCount: number
  imageGenerationWaitCount: number
  /** 途中経過の取得に使うタスクの nanoid */
  taskNanoid?: string | null
  /** 1 回の依頼で作る枚数 */
  imageCount?: number
}

const RAINBOW =
  "conic-gradient(from 0deg, #ff6b9d, #ffb86b, #ffe66b, #6bffb8, #6bd5ff, #9d8bff, #ff6bd5, #ff6b9d)"

/**
 * 生成中の履歴（虹色のグラデーションと途中経過の画像）
 */
export function InProgressGenerationCard(props: Props) {
  const dataContext = useContext(GenerationQueryContext)

  const t = useTranslation()

  const isStandardOrPremium =
    dataContext.currentPass?.type === "STANDARD" ||
    dataContext.currentPass?.type === "PREMIUM"

  const passType = dataContext.currentPass?.type ?? null

  // 無料の人には「プランなら順番が先・1 回 4 枚」、ライトの人には順番待ちのときだけ「スタンダード以上は最優先」を出す
  // （順番は生成ワーカーの queue-policy と pass の priority で確かめた: スタンダード・プレミアム → ライト → 無料）
  const hint =
    dataContext.currentPass === null
      ? "free"
      : passType === "LITE" && props.inProgressNormalCount > 0
        ? "lite"
        : null

  const liteOffer = useLiteOffer().offer
  // 無料の人で、お試しか初月半額かを確認している間は出さない（出た後に文言が変わらないように）
  const isHintVisible = hint !== null && !(hint === "free" && liteOffer === "unknown")
  const isTrialHint = hint === "free" && liteOffer === "trial"

  useEffect(() => {
    if (!isHintVisible || hint === null) return
    trackGrowthEventOnce("gen_wait_view", hint)
    if (isTrialHint) trackGrowthEventOnce("trial_view", "gen_wait")
  }, [isHintVisible, hint, isTrialHint])

  const progress = useGenerationProgress(props.taskNanoid, !props.isCanceling)

  const imageCount = props.imageCount ?? 1
  const percent = Math.round((progress?.progress ?? 0) * 100)
  const isActive = progress?.state === "active"
  const isCompleted = progress?.state === "completed"

  const statusLabel = (() => {
    if (isCompleted) return t("仕上げ中…", "Finishing up…")
    if (isActive) return t(`生成中 ${percent}%`, `Generating ${percent}%`)
    if (progress?.state === "queued") {
      return progress.queuePosition
        ? t(
            `まもなく開始（あと${progress.queuePosition}件）`,
            `Starting soon (${progress.queuePosition} ahead)`,
          )
        : t("まもなく開始", "Starting soon")
    }
    if (props.imageGenerationWaitCount > 0) {
      return t(
        `順番待ち（あと${props.imageGenerationWaitCount}件）`,
        `In the queue (${props.imageGenerationWaitCount} ahead)`,
      )
    }
    return t("準備中…", "Getting ready…")
  })()

  return (
    <div className="relative size-full overflow-hidden rounded-xl p-[2px]">
      {/* 回転する虹色の枠 */}
      <div
        aria-hidden
        className="-inset-[60%] absolute animate-[spin_3.5s_linear_infinite]"
        style={{ background: RAINBOW }}
      />
      <div className="relative flex h-full flex-col overflow-hidden rounded-[10px] bg-background">
        {/* 背景: 途中経過の画像、なければ虹色のぼかし */}
        <div className="absolute inset-0">
          {progress?.preview ? (
            <img
              src={progress.preview}
              alt=""
              className="size-full object-cover transition-[filter,opacity] duration-700"
              style={{
                filter: `blur(${Math.max(0, 6 - (progress.progress ?? 0) * 8)}px) saturate(1.15)`,
              }}
            />
          ) : (
            <div
              aria-hidden
              className="-inset-1/2 absolute animate-[spin_9s_linear_infinite] opacity-60 blur-2xl"
              style={{ background: RAINBOW }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/20" />
        </div>

        <div className="relative flex items-start justify-between p-2 [&_button]:text-white [&_svg]:drop-shadow">
          <span className="inline-flex items-center gap-1 rounded-full bg-black/45 px-2 py-0.5 font-semibold text-[11px] text-white backdrop-blur-sm">
            <SparklesIcon className="size-3" />
            {imageCount > 1
              ? t(`${imageCount}枚まとめて`, `${imageCount} images`)
              : t("1枚", "1 image")}
          </span>
          <GenerationTaskCancelButton
            onCancel={props.onCancel}
            isDisabled={props.isCreatingTasks}
            isCanceling={props.isCanceling}
          />
        </div>

        <div className="relative mt-auto space-y-1.5 p-2.5">
          <p
            className={cn(
              "font-bold text-sm text-white drop-shadow",
              !isActive && "animate-pulse",
            )}
          >
            {statusLabel}
          </p>
          {/* 虹色の進捗バー */}
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/25">
            <div
              className="h-full rounded-full transition-[width] duration-700 ease-out"
              style={{
                width: `${isCompleted ? 100 : Math.max(isActive ? 4 : 0, percent)}%`,
                background:
                  "linear-gradient(90deg, #ff6b9d, #ffb86b, #ffe66b, #6bffb8, #6bd5ff, #9d8bff)",
              }}
            />
          </div>
          {isHintVisible && hint !== null && (
            <Link
              to="/plus#plans"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                trackGrowthEvent("gen_wait_click", hint)
                if (isTrialHint) trackGrowthEvent("trial_click", "gen_wait")
              }}
              className="inline-flex items-center gap-1 text-[11px] text-cyan-200 underline-offset-2 hover:underline"
            >
              <ZapIcon className="size-3 shrink-0" />
              {isTrialHint
                ? t(
                    `プランなら順番が先・1回で4枚（ライトは${TRIAL_DAYS}日間無料）`,
                    `Skip ahead and get 4 images per click — try Lite free for ${TRIAL_DAYS} days`,
                  )
                : hint === "free"
                ? t(
                    "プランなら順番が先・1回で4枚（初月¥240〜）",
                    "Skip ahead and get 4 images per click, from ¥240",
                  )
                : t(
                    "スタンダード以上は最優先で生成",
                    "Standard and Premium go first in the queue",
                  )}
            </Link>
          )}
          {passType === "LITE" && !isActive && !isCompleted && (
            <p className="inline-flex items-center gap-1 text-[11px] text-cyan-200">
              <ZapIcon className="size-3 shrink-0" />
              {t(
                "ライト：無料の方より先に生成します",
                "Lite: you go ahead of free users",
              )}
            </p>
          )}
          {isStandardOrPremium && props.inProgressNormalCount > 0 && (
            <p className="inline-flex items-center gap-1 text-[11px] text-cyan-200">
              <ZapIcon className="size-3" />
              {t(
                `優先生成：${props.inProgressNormalCount}人をスキップ中`,
                `Priority: ahead of ${props.inProgressNormalCount} in the queue`,
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
