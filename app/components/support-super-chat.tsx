/**
 * 推しをスーパーチャットのように見せる部品（段階の色の帯・コイン数の大きな表示・報酬の一言）
 * 段階の区切りと色は ~/utils/support-tier。アプリの lib/v2/widgets/support_tier.dart と同じ見た目
 *
 * 推す側の画面では「〇〇円を送る」とは書かない（コインで応援 → 運営がクリエイターに報酬を払う、の建て付け）
 */
import { HeartHandshake, Sparkles } from "lucide-react"
import type { ReactNode } from "react"
import {
  FreeSupportCoinIcon,
  PremiumSupportCoinIcon,
} from "~/components/support-coin-icons"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { cn } from "~/lib/utils"
import { getSupportTier, type SupportTier } from "~/utils/support-tier"

type SupportAmount = {
  freeCoinAmount: number
  premiumCoinAmount: number
  totalPt: number
}

/** 読み上げ用の金額の文 */
export const useSupportAmountLabel = () => {
  const t = useTranslation()
  return (support: SupportAmount) =>
    [
      support.premiumCoinAmount > 0
        ? t(
            `プレミアムコイン ${support.premiumCoinAmount.toLocaleString()}枚`,
            `${support.premiumCoinAmount.toLocaleString()} premium coins`,
          )
        : null,
      support.freeCoinAmount > 0
        ? t(
            `フリーコイン ${support.freeCoinAmount.toLocaleString()}枚`,
            `${support.freeCoinAmount.toLocaleString()} free coins`,
          )
        : null,
      `${support.totalPt.toLocaleString()}pt`,
    ]
      .filter(Boolean)
      .join(t("・", ", "))
}

/** コインの枚数を大きく（プレミアムを先に） */
export function SupportCoinCounts(props: {
  support: SupportAmount
  size?: "md" | "lg"
  className?: string
}) {
  const large = props.size === "lg"
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-black tabular-nums leading-none",
        large ? "text-2xl" : "text-lg",
        props.className,
      )}
      aria-hidden
    >
      {props.support.premiumCoinAmount > 0 && (
        <span className="inline-flex items-center gap-1">
          <PremiumSupportCoinIcon
            className={cn(
              "rounded-full bg-white/90 p-px",
              large ? "size-6" : "size-5",
            )}
          />
          {props.support.premiumCoinAmount.toLocaleString()}
        </span>
      )}
      {props.support.freeCoinAmount > 0 && (
        <span className="inline-flex items-center gap-1">
          <FreeSupportCoinIcon
            className={cn(
              "rounded-full bg-white/90 p-px",
              large ? "size-6" : "size-5",
            )}
          />
          {props.support.freeCoinAmount.toLocaleString()}
        </span>
      )}
    </span>
  )
}

/**
 * 推し付きコメントの帯と本文の囲み。children が本文（無ければ帯だけ）
 */
export function SupportSuperChatCard(props: {
  support: SupportAmount
  children?: ReactNode
  header?: ReactNode
  className?: string
}) {
  const t = useTranslation()
  const toLabel = useSupportAmountLabel()
  const tier = getSupportTier(props.support.totalPt)
  if (!tier) return <>{props.children}</>
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl ring-1",
        tier.bodyClassName,
        props.className,
      )}
      data-support-tier={tier.level}
    >
      <div
        className={cn(
          "relative flex items-center gap-2 overflow-hidden px-3 py-2",
          tier.bandClassName,
        )}
      >
        {tier.level >= 4 && (
          // 高い段階だけ、光が 1 回だけ横切る（動きを減らす設定では出さない）
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 hidden w-1/4 bg-white/25 motion-safe:block opacity-0 motion-safe:animate-[aip-support-shine_1.6s_ease-out_0.3s_1_both]"
          />
        )}
        <HeartHandshake className="size-4 shrink-0" aria-hidden />
        <div className="min-w-0 flex-1">
          {props.header ?? (
            <span className="font-bold text-xs">
              {t("推しコインで応援", "Supported with coins")}
            </span>
          )}
        </div>
        <span className="sr-only">{toLabel(props.support)}</span>
        <div className="flex shrink-0 flex-col items-end">
          <SupportCoinCounts support={props.support} />
          <span className="font-bold text-[10px] tabular-nums opacity-90">
            {props.support.totalPt.toLocaleString()}pt
          </span>
        </div>
      </div>
      {props.children && <div className="px-3 py-2.5">{props.children}</div>}
    </div>
  )
}

/** 小さなしるし（通知・応援の帯・一覧） */
export function SupportTierChip(props: {
  support: SupportAmount
  className?: string
}) {
  const toLabel = useSupportAmountLabel()
  const tier = getSupportTier(props.support.totalPt)
  if (!tier) return null
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-black text-xs tabular-nums",
        tier.chipClassName,
        props.className,
      )}
      title={toLabel(props.support)}
    >
      {props.support.premiumCoinAmount > 0 && (
        <span className="inline-flex items-center gap-0.5">
          <PremiumSupportCoinIcon className="size-3.5 rounded-full bg-white/90" />
          {props.support.premiumCoinAmount.toLocaleString()}
        </span>
      )}
      {props.support.freeCoinAmount > 0 && (
        <span className="inline-flex items-center gap-0.5">
          <FreeSupportCoinIcon className="size-3.5 rounded-full bg-white/90" />
          {props.support.freeCoinAmount.toLocaleString()}
        </span>
      )}
      <span className="font-bold opacity-90">
        {props.support.totalPt.toLocaleString()}pt
      </span>
    </span>
  )
}

/** 金額ボタンの見た目（選んだら段階の塗り） */
export const supportAmountButtonClassName = (
  tier: SupportTier | null,
  isSelected: boolean,
) =>
  cn(
    "border-2 font-black tabular-nums transition-colors disabled:opacity-40",
    tier
      ? isSelected
        ? cn(tier.chipClassName, "border-transparent shadow-sm")
        : cn("bg-background", tier.outlineClassName)
      : "bg-background",
  )

/**
 * 「応援はクリエイターの報酬につながります」の一言。R18 の作品では出さない（報酬の対象外）
 * 送金ではなく、運営がクリエイターに払う報酬であることが分かる言い方にする
 */
export function SupportRewardNote(props: {
  /** 作品経由のとき true（作品の年齢区分で出し分ける）。プロフィールからの推しは false */
  isWork?: boolean
  className?: string
}) {
  const t = useTranslation()
  return (
    <p
      className={cn(
        "flex items-start gap-1.5 text-muted-foreground text-xs leading-relaxed",
        props.className,
      )}
    >
      <Sparkles className="mt-0.5 size-3.5 shrink-0 text-amber-500" />
      <span>
        {props.isWork
          ? t(
              "購入したプレミアムコインでの応援は、クリエイターの報酬につながります（クリエイター報酬に参加している人・全年齢の作品が対象）。",
              "Support with purchased Premium Coins helps fund creator rewards (for creators in Creator Rewards, all-ages works only).",
            )
          : t(
              "購入したプレミアムコインでの応援は、条件を満たすとクリエイターの報酬につながります。",
              "Support with purchased Premium Coins can help fund creator rewards when the conditions are met.",
            )}{" "}
        <Link
          to="/creator-rewards/terms"
          className="whitespace-nowrap text-foreground underline underline-offset-2"
        >
          {t("クリエイター報酬とは", "About Creator Rewards")}
        </Link>
      </span>
    </p>
  )
}

/**
 * 送ったときの演出。コインがふわっと上がって消える（1 回だけ・動きを減らす設定では出さない）
 */
export function SupportSentBurst(props: {
  totalPt: number
  className?: string
}) {
  const tier = getSupportTier(props.totalPt)
  if (!tier) return null
  const count = Math.min(3 + tier.level, 9)
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-x-0 top-6 hidden h-0 justify-center motion-safe:flex",
        props.className,
      )}
    >
      {Array.from({ length: count }, (_, index) => (
        <span
          // biome-ignore lint/suspicious/noArrayIndexKey: 並びは変わらない
          key={index}
          className="absolute motion-safe:animate-[aip-support-rise_1.4s_ease-out_both]"
          style={{
            left: `${50 + (index - (count - 1) / 2) * 9}%`,
            animationDelay: `${(index % 3) * 120 + index * 40}ms`,
          }}
        >
          <PremiumSupportCoinIcon className="size-5" />
        </span>
      ))}
    </div>
  )
}
