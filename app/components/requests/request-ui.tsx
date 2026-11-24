import { CalendarClock, Check, Images, RefreshCcw } from "lucide-react"
import { PremiumCoinIcon } from "~/components/premium-coin-icon"
import { RequestMediaThumb } from "~/components/requests/request-media-thumb"
import { useAutoTranslation } from "~/hooks/use-auto-translation"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import {
  type CoinRequest,
  formatCoins,
  planCategoryLabel,
  planImageUrls,
  type RequestPlan,
  type RequestStatus,
  requestStatusLabel,
} from "~/lib/requests-api"
import { cn } from "~/lib/utils"

/** 有料リクエストの画面で使う部品（Web とアプリで同じ見た目: 角の丸いカード・丸いタブ・下に固定のボタン） */

export type RequestUser = {
  id: string
  login: string
  name: string
  iconUrl: string | null
}
export type RequestUsers = Record<string, RequestUser>

export function RequestUserChip(props: {
  user?: RequestUser | null
  size?: "sm" | "md"
  className?: string
  link?: boolean
}) {
  const t = useTranslation()
  const size = props.size === "md" ? "size-9" : "size-6"
  const body = (
    <span
      className={cn("inline-flex min-w-0 items-center gap-2", props.className)}
    >
      {props.user?.iconUrl ? (
        <img
          src={props.user.iconUrl}
          alt=""
          className={cn(size, "shrink-0 rounded-full object-cover")}
          loading="lazy"
        />
      ) : (
        <span className={cn(size, "shrink-0 rounded-full bg-muted")} />
      )}
      <span className="truncate font-medium text-sm">
        {props.user?.name ?? t("ユーザー", "User")}
      </span>
    </span>
  )
  if (props.link === false || !props.user?.login) return body
  return (
    <Link
      to={`/users/${props.user.login}`}
      className="min-w-0 hover:opacity-80"
    >
      {body}
    </Link>
  )
}

export function CoinPrice(props: { coins: number; className?: string }) {
  const t = useTranslation()
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-bold",
        props.className,
      )}
    >
      <PremiumCoinIcon className="size-4" />
      {formatCoins(props.coins, t.isEnglish)}
    </span>
  )
}

/** プランのカード（一覧・クリエイターのページの横スクロール） */
export function RequestPlanCard(props: {
  plan: RequestPlan
  user?: RequestUser | null
  compact?: boolean
  showStatus?: boolean
}) {
  const t = useTranslation()
  const { plan } = props
  // 英語の画面では日本語のタイトルを自動で英語にする（カードの中なので切り替えは詳しいページで）
  const title = useAutoTranslation(plan.title).text
  const full =
    plan.activeCount !== undefined && plan.activeCount >= plan.maxActive
  const closed = !plan.isAccepting || full
  const cover = planImageUrls(plan)[0]
  return (
    <Link
      to={`/requests/plans/${plan.id}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border bg-card transition-shadow hover:shadow-md active:scale-[0.99]",
        props.compact ? "w-56 shrink-0" : "w-full",
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        {cover ? (
          <img
            src={cover}
            alt=""
            loading="lazy"
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            <Images className="size-8 opacity-40" />
          </div>
        )}
        <span className="absolute top-2 left-2 rounded-full bg-background/90 px-2.5 py-1 font-bold text-[11px] backdrop-blur">
          {planCategoryLabel(plan.category, t.isEnglish)}
        </span>
        {plan.allowsR18 && (
          <span className="absolute top-2 right-2 rounded-full bg-rose-500 px-2 py-0.5 font-bold text-[10px] text-white">
            {t("R18可", "R18 OK")}
          </span>
        )}
        {closed && (
          <span className="absolute inset-x-0 bottom-0 bg-black/60 py-1 text-center font-bold text-white text-xs">
            {full
              ? t("受付上限に達しています", "Fully booked")
              : t("受付停止中", "Not accepting")}
          </span>
        )}
        {props.showStatus && plan.status === "HIDDEN" && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/50 font-bold text-sm text-white">
            {t("非公開", "Hidden")}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <p className="line-clamp-2 font-bold text-sm leading-snug">{title}</p>
        {props.user && <RequestUserChip user={props.user} link={false} />}
        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <CoinPrice coins={plan.priceCoins} className="text-base" />
          <span className="flex items-center gap-1 text-muted-foreground text-xs">
            <CalendarClock className="size-3.5" />
            {t(
              `${plan.deliveryDays}日`,
              `${plan.deliveryDays} ${plan.deliveryDays === 1 ? "day" : "days"}`,
            )}
          </span>
        </div>
        <div className="flex gap-3 text-[11px] text-muted-foreground">
          <span>
            {t(
              `${plan.imageCount}枚`,
              `${plan.imageCount} ${plan.imageCount === 1 ? "image" : "images"}`,
            )}
          </span>
          <span className="inline-flex items-center gap-0.5">
            <RefreshCcw className="size-3" />
            {t(
              `修正${plan.revisionCount}回`,
              `${plan.revisionCount} ${plan.revisionCount === 1 ? "revision" : "revisions"}`,
            )}
          </span>
          {plan.completedCount > 0 && (
            <span>
              {t(
                `実績 ${plan.completedCount}件`,
                `${plan.completedCount} completed`,
              )}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

const STATUS_COLORS: Record<RequestStatus, string> = {
  PENDING:
    "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300",
  ACCEPTED: "bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300",
  DELIVERED:
    "bg-violet-100 text-violet-800 dark:bg-violet-500/20 dark:text-violet-300",
  COMPLETED:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300",
  ADMIN_COMPLETED:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300",
  DECLINED: "bg-muted text-muted-foreground",
  CANCELED: "bg-muted text-muted-foreground",
  EXPIRED: "bg-muted text-muted-foreground",
  ADMIN_CANCELED: "bg-muted text-muted-foreground",
}

export function RequestStatusBadge(props: { status: RequestStatus }) {
  const t = useTranslation()
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 font-bold text-[11px]",
        STATUS_COLORS[props.status],
      )}
    >
      {requestStatusLabel(props.status, t.isEnglish)}
    </span>
  )
}

const STEPS: Array<{ key: string; label: string; enLabel: string }> = [
  { key: "PENDING", label: "申し込み", enLabel: "Requested" },
  { key: "ACCEPTED", label: "制作中", enLabel: "In progress" },
  { key: "DELIVERED", label: "納品", enLabel: "Delivered" },
  { key: "COMPLETED", label: "完了", enLabel: "Done" },
]

/** 進み具合（申し込み → 制作中 → 納品 → 完了） */
export function RequestSteps(props: { request: CoinRequest }) {
  const t = useTranslation()
  const order = ["PENDING", "ACCEPTED", "DELIVERED", "COMPLETED"]
  const status =
    props.request.status === "ADMIN_COMPLETED"
      ? "COMPLETED"
      : props.request.status
  const index = order.indexOf(status)
  if (index < 0) return null
  return (
    <ol className="flex items-center gap-1">
      {STEPS.map((step, i) => {
        const done = i < index || status === "COMPLETED"
        const current = i === index && status !== "COMPLETED"
        return (
          <li key={step.key} className="flex flex-1 items-center gap-1">
            <div className="flex flex-col items-center gap-1">
              <span
                className={cn(
                  "flex size-7 items-center justify-center rounded-full font-bold text-xs",
                  done && "bg-primary text-primary-foreground",
                  current &&
                    "bg-foreground text-background ring-4 ring-foreground/15",
                  !done && !current && "bg-muted text-muted-foreground",
                )}
              >
                {done ? <Check className="size-4" /> : i + 1}
              </span>
              <span
                className={cn(
                  "whitespace-nowrap text-[11px]",
                  current ? "font-bold" : "text-muted-foreground",
                )}
              >
                {t(step.label, step.enLabel)}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <span
                className={cn(
                  "mb-5 h-0.5 flex-1 rounded-full",
                  i < index ? "bg-primary" : "bg-muted",
                )}
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}

/** 画像の並び（タップで大きく。納品の GIF アニメ・動画もそのまま開く） */
export function RequestImageGrid(props: {
  urls: string[]
  className?: string
}) {
  if (props.urls.length === 0) return null
  return (
    <div
      className={cn("grid grid-cols-3 gap-2 sm:grid-cols-4", props.className)}
    >
      {props.urls.map((url) => (
        <a
          key={url}
          href={url}
          target="_blank"
          rel="noreferrer"
          className="block aspect-square overflow-hidden rounded-xl bg-muted"
        >
          <RequestMediaThumb url={url} lazy />
        </a>
      ))}
    </div>
  )
}
