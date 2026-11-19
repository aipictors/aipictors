/**
 * 推しをスーパーチャットのように見せる部品（段階の色の帯・コイン数の大きな表示・報酬の一言）
 * 段階の区切りと色は ~/utils/support-tier。アプリの lib/v2/widgets/support_tier.dart と同じ見た目
 *
 * 推す側の画面では「〇〇円を送る」とは書かない（コインで応援 → 運営がクリエイターに報酬を払う、の建て付け）
 */
import { BadgeCheck, Heart, Sparkles } from "lucide-react"
import type { ReactNode } from "react"
import {
  FreeSupportCoinIcon,
  PremiumSupportCoinIcon,
} from "~/components/support-coin-icons"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { cn } from "~/lib/utils"
import {
  getSupportTier,
  SUPPORT_TOP_TIER_LEVEL,
  type SupportTier,
} from "~/utils/support-tier"

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
  size?: "sm" | "md" | "lg"
  className?: string
}) {
  const large = props.size === "lg"
  const small = props.size === "sm"
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-black tabular-nums leading-none",
        large ? "text-2xl" : small ? "text-sm" : "text-lg",
        props.className,
      )}
      aria-hidden
    >
      {props.support.premiumCoinAmount > 0 && (
        <span className="inline-flex items-center gap-1">
          <PremiumSupportCoinIcon
            className={cn(
              "rounded-full bg-white/90 p-px",
              large ? "size-6" : small ? "size-4" : "size-5",
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
              large ? "size-6" : small ? "size-4" : "size-5",
            )}
          />
          {props.support.freeCoinAmount.toLocaleString()}
        </span>
      )}
    </span>
  )
}

/**
 * 推し付きコメントの囲み。YouTube のスーパーサンクスのように、うすい段階の色の下地と金額のチップで普通のコメントと分ける。
 * children が本文とスタンプ（無ければチップだけ）。header はチップの前に出す名前（送る画面の見本）
 */
export function SupportSuperChatCard(props: {
  support: SupportAmount
  children?: ReactNode
  header?: ReactNode
  className?: string
}) {
  const t = useTranslation()
  const toLabel = useSupportAmountLabel()
  const tier = getSupportTier(props.support)
  if (!tier) return <>{props.children}</>
  return (
    <div
      className={cn(
        "space-y-2 rounded-2xl px-3 py-2.5 ring-1",
        tier.bodyClassName,
        props.className,
      )}
      data-support-tier={tier.level}
    >
      <div className="flex min-w-0 items-center gap-2">
        {props.header && <div className="min-w-0">{props.header}</div>}
        <span
          className={cn(
            "relative inline-flex shrink-0 items-center gap-1 overflow-hidden rounded-full py-0.5 pr-2.5 pl-2",
            tier.chipClassName,
          )}
        >
          {tier.level >= SUPPORT_TOP_TIER_LEVEL && (
            // 高い段階だけ、光が 1 回だけ横切る（動きを減らす設定では出さない）
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-0 hidden w-1/3 bg-white/30 motion-safe:block opacity-0 motion-safe:animate-[aip-support-shine_1.6s_ease-out_0.3s_1_both]"
            />
          )}
          <Heart className="size-3.5 fill-current" aria-hidden />
          <SupportCoinCounts support={props.support} size="sm" />
        </span>
        <span className="sr-only">
          {t("推しコインで応援", "Supported with coins")}
          {t("・", ", ")}
          {toLabel(props.support)}
        </span>
      </div>
      {props.children}
    </div>
  )
}

/** 小さなしるし（通知・応援の帯・一覧） */
export function SupportTierChip(props: {
  support: SupportAmount
  className?: string
}) {
  const toLabel = useSupportAmountLabel()
  const tier = getSupportTier(props.support)
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
 * 「応援はクリエイターの報酬につながります」の一言。作者が報酬に参加していて全年齢の作品のときだけ出すので、
 * 条件の括弧書きは付けない（作品のコメントからもプロフィールからも同じ言い方）
 * 送金ではなく、運営がクリエイターに払う報酬であることが分かる言い方にする
 */
export function SupportRewardNote(props: { className?: string }) {
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
        {t(
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
 * 「クリエイター報酬に参加しています」の印。推す画面で、報酬に参加している作者だけに出す
 * （R18 の作品・プレミアムコインを受け取らない作者では出さない）。押すと説明のページへ
 */
export function SupportRewardJoinedBadge(props: { className?: string }) {
  const t = useTranslation()
  const label = t(
    "このクリエイターはクリエイター報酬に参加しています",
    "This creator is part of Creator Rewards",
  )
  return (
    <Link
      to="/creator-rewards/terms"
      title={label}
      aria-label={label}
      className={cn(
        "inline-flex w-fit shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-amber-500/10 px-2 py-0.5 font-bold text-[11px] text-amber-700 ring-1 ring-amber-500/30 hover:bg-amber-500/20 dark:text-amber-300",
        props.className,
      )}
    >
      <BadgeCheck className="size-3.5" />
      {t("報酬に参加中", "In Creator Rewards")}
    </Link>
  )
}

/**
 * 送ったときの演出。コインがふわっと上がって消える（1 回だけ・動きを減らす設定では出さない）
 */
export function SupportSentBurst(props: {
  support: { freeCoinAmount: number; premiumCoinAmount: number }
  className?: string
}) {
  const tier = getSupportTier(props.support)
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
