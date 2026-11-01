import { Link } from "@remix-run/react"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  ImageIcon,
  ImagePlusIcon,
  SparklesIcon,
  WandSparklesIcon,
} from "lucide-react"
import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import { getJstDate } from "~/utils/jst-date"

export type ThemeHeroTheme = {
  id: string
  title: string
  year: number
  month: number
  day: number
  note?: string | null
  firstWork?: { smallThumbnailImageURL: string } | null
  proposer?: { id: string; name: string; iconUrl?: string | null } | null
}

type Props = {
  theme: ThemeHeroTheme | null
  /** 表示している日付（お題が無い日も日付は出す） */
  year: number
  month: number
  day: number
  worksCount: number
  /** "today" = 今日のお題、"past" = 受付終了、"future" = 予告 */
  timing: "today" | "past" | "future"
  isSensitive: boolean
  hasPreviousDay: boolean
  hasNextDay: boolean
  onPreviousDay: () => void
  onNextDay: () => void
}

const WEEK_DAYS_JA = ["日", "月", "火", "水", "木", "金", "土"]
const WEEK_DAYS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

/**
 * お題ページの一番上に出す、表示中のお題の大きなカード
 */
export function ThemeHero(props: Props) {
  const t = useTranslation()

  const weekDay = new Date(props.year, props.month - 1, props.day).getDay()

  const dateLabel = t(
    `${props.month}月${props.day}日（${WEEK_DAYS_JA[weekDay]}）`,
    `${WEEK_DAYS_EN[weekDay]}, ${props.month}/${props.day}`,
  )

  const timingLabel =
    props.timing === "today"
      ? t("今日のお題", "Today's theme")
      : props.timing === "future"
        ? t("予告", "Coming soon")
        : t("過去のお題", "Past theme")

  // 背景はお題の最初の作品をぼかして使う（センシティブでは使わない）
  const backgroundUrl = props.isSensitive
    ? null
    : (props.theme?.firstWork?.smallThumbnailImageURL ?? null)

  return (
    <section
      className={cn(
        "relative isolate overflow-hidden rounded-3xl border p-5 text-white shadow-sm md:p-7",
        props.isSensitive
          ? "border-rose-900/40 bg-linear-to-br from-rose-700 via-fuchsia-800 to-zinc-900"
          : "border-violet-300/40 bg-linear-to-br from-violet-600 via-fuchsia-500 to-rose-400",
      )}
    >
      {backgroundUrl && (
        <img
          src={backgroundUrl}
          alt=""
          aria-hidden="true"
          className="-z-10 absolute inset-0 size-full scale-110 object-cover opacity-35 blur-2xl"
        />
      )}
      <div
        aria-hidden="true"
        className="-z-10 absolute inset-0 bg-linear-to-t from-black/30 via-black/5 to-transparent"
      />
      <div
        aria-hidden="true"
        className="-top-16 -right-16 -z-10 absolute size-56 rounded-full bg-white/15 blur-3xl"
      />

      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-3 py-1 font-semibold text-xs",
              props.timing === "today"
                ? "bg-white text-fuchsia-700"
                : "bg-white/20 text-white backdrop-blur",
            )}
          >
            {props.timing === "today" && <SparklesIcon className="size-3.5" />}
            {timingLabel}
          </span>
          <span className="font-medium text-sm text-white/90">{dateLabel}</span>
          {props.isSensitive && (
            <span className="rounded-full bg-black/30 px-2.5 py-0.5 text-white/90 text-xs">
              {t("センシティブ", "Sensitive")}
            </span>
          )}
        </div>
        <div className="flex shrink-0 gap-1.5">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={props.onPreviousDay}
            disabled={!props.hasPreviousDay}
            aria-label={t("前の日のお題", "Previous day")}
            className="size-9 rounded-full bg-white/15 text-white hover:bg-white/30 hover:text-white"
          >
            <ChevronLeftIcon className="size-5" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={props.onNextDay}
            disabled={!props.hasNextDay}
            aria-label={t("次の日のお題", "Next day")}
            className="size-9 rounded-full bg-white/15 text-white hover:bg-white/30 hover:text-white"
          >
            <ChevronRightIcon className="size-5" />
          </Button>
        </div>
      </div>

      <h2 className="mt-4 break-words font-black text-3xl leading-tight tracking-tight drop-shadow-sm md:text-5xl">
        {props.theme ? (
          <>
            <span className="mr-1 font-bold text-white/70">「</span>
            {props.theme.title}
            <span className="ml-1 font-bold text-white/70">」</span>
          </>
        ) : (
          <span className="text-2xl text-white/80 md:text-3xl">
            {t("この日のお題はありません", "No theme for this day")}
          </span>
        )}
      </h2>

      {props.theme?.note && props.theme.note.trim().length > 0 && (
        <p className="mt-3 line-clamp-3 max-w-2xl whitespace-pre-wrap text-sm text-white/90 leading-relaxed">
          {props.theme.note}
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {props.theme && props.timing !== "future" && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-black/25 px-3 py-1.5 text-sm backdrop-blur">
            <ImageIcon className="size-4" />
            <span className="font-bold">{props.worksCount.toLocaleString()}</span>
            {t("作品", "works")}
          </span>
        )}
        {props.timing === "today" && <ThemeCountdown />}
        {props.theme?.proposer && (
          <Link
            to={`/users/${props.theme.proposer.id}`}
            className="inline-flex items-center gap-2 rounded-full bg-black/25 py-1 pr-3 pl-1 text-sm backdrop-blur transition hover:bg-black/40"
          >
            <Avatar className="size-6 border border-white/60">
              <AvatarImage
                resizeWidth={96}
                src={props.theme.proposer.iconUrl ?? ""}
                alt=""
              />
              <AvatarFallback className="text-[10px] text-foreground">
                {props.theme.proposer.name.slice(0, 1)}
              </AvatarFallback>
            </Avatar>
            <span className="max-w-40 truncate">
              {t(
                `${props.theme.proposer.name}さんの提案`,
                `Proposed by ${props.theme.proposer.name}`,
              )}
            </span>
          </Link>
        )}
      </div>

      {props.theme && props.timing === "today" && (
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="h-12 rounded-full bg-white px-6 font-bold text-base text-fuchsia-700 shadow-lg hover:bg-white/90"
          >
            <Link to={`/new/image?theme=${props.theme.id}`}>
              <ImagePlusIcon className="mr-2 size-5" />
              {t("このお題で投稿する", "Post for this theme")}
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="ghost"
            className="h-12 rounded-full border border-white/50 bg-white/10 px-6 font-semibold text-white backdrop-blur hover:bg-white/20 hover:text-white"
          >
            <Link to="/generation">
              <WandSparklesIcon className="mr-2 size-5" />
              {t("画像を生成する", "Generate images")}
            </Link>
          </Button>
        </div>
      )}

      {props.theme && props.timing === "future" && (
        <p className="mt-5 text-sm text-white/90">
          {t(
            "当日の0時から投稿できます。今のうちに作っておきましょう！",
            "Posting opens at 0:00 on the day. Get a head start!",
          )}
        </p>
      )}

      {props.theme && props.timing === "past" && (
        <p className="mt-5 text-sm text-white/80">
          {t(
            "このお題の受付は終わりました。みんなの作品を見てみましょう。",
            "This theme has closed. Take a look at everyone's works.",
          )}
        </p>
      )}
    </section>
  )
}

/**
 * 今日のお題の締め切り（日本時間の0時）までの残り時間
 * サーバーとブラウザで時刻がずれるので、表示はマウント後だけ
 */
function ThemeCountdown() {
  const t = useTranslation()

  const [remainingMinutes, setRemainingMinutes] = useState<number | null>(null)

  useEffect(() => {
    const update = () => {
      const now = getJstDate(new Date())
      const midnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
      )
      setRemainingMinutes(
        Math.max(0, Math.ceil((midnight.getTime() - now.getTime()) / 60000)),
      )
    }
    update()
    const id = window.setInterval(update, 30 * 1000)
    return () => window.clearInterval(id)
  }, [])

  if (remainingMinutes === null) {
    return null
  }

  const hours = Math.floor(remainingMinutes / 60)
  const minutes = remainingMinutes % 60

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm backdrop-blur",
        hours < 3 ? "bg-amber-400/90 text-amber-950" : "bg-black/25",
      )}
    >
      <ClockIcon className="size-4" />
      {t(
        `締め切りまで ${hours > 0 ? `${hours}時間` : ""}${minutes}分`,
        `${hours > 0 ? `${hours}h ` : ""}${minutes}m left`,
      )}
    </span>
  )
}
