import { Bug, Megaphone, RefreshCw, Wrench } from "lucide-react"
import { ReleaseTagBadge } from "~/components/release-tag-badge"
import { Link } from "~/lib/app/locale-router"
import { cn } from "~/lib/utils"
import { type ReleaseCard, toReleaseTone } from "~/utils/release-card"

type Props = {
  release: ReleaseCard
  /** featured: 一覧の先頭の大きいカード / grid: 一覧のカード / compact: 詳細の下の「ほかのお知らせ」 */
  variant: "featured" | "grid" | "compact"
  isPriority?: boolean
}

/** 表紙の画像がないときの色とアイコン（タグごと） */
const TONES = {
  アップデート: {
    icon: RefreshCw,
    className:
      "from-emerald-100 via-teal-50 to-sky-100 text-emerald-600 dark:from-emerald-950 dark:via-teal-950 dark:to-sky-950 dark:text-emerald-300",
  },
  不具合対応: {
    icon: Bug,
    className:
      "from-amber-100 via-orange-50 to-rose-100 text-amber-600 dark:from-amber-950 dark:via-orange-950 dark:to-rose-950 dark:text-amber-300",
  },
  メンテナンス: {
    icon: Wrench,
    className:
      "from-sky-100 via-blue-50 to-indigo-100 text-sky-600 dark:from-sky-950 dark:via-blue-950 dark:to-indigo-950 dark:text-sky-300",
  },
  お知らせ: {
    icon: Megaphone,
    className:
      "from-violet-100 via-fuchsia-50 to-pink-100 text-violet-600 dark:from-violet-950 dark:via-fuchsia-950 dark:to-pink-950 dark:text-violet-300",
  },
} as const

/**
 * 表紙（縦長の 4 コマが多いので上を合わせる。真ん中で切るとタイトルが隠れてコマの途中だけになる）
 */
function ReleaseCover(props: {
  release: ReleaseCard
  isPriority?: boolean
  className?: string
}) {
  const tone = TONES[toReleaseTone(props.release.tag)]
  const Icon = tone.icon

  return (
    <div
      className={cn(
        "relative aspect-[16/9] w-full overflow-hidden bg-muted",
        props.className,
      )}
    >
      {props.release.coverUrl ? (
        <img
          src={props.release.coverUrl}
          alt=""
          loading={props.isPriority ? "eager" : "lazy"}
          fetchPriority={props.isPriority ? "high" : "auto"}
          decoding="async"
          className="size-full object-cover object-top transition-transform duration-500 motion-safe:group-hover:scale-[1.03]"
        />
      ) : (
        <div
          className={cn(
            "flex size-full items-center justify-center bg-gradient-to-br",
            tone.className,
          )}
        >
          <Icon className="size-10 opacity-70" strokeWidth={1.5} />
        </div>
      )}
    </div>
  )
}

function ReleaseMeta(props: { release: ReleaseCard }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      {props.release.isNew && (
        <span className="rounded-full bg-rose-500 px-2 py-0.5 font-bold text-[10px] text-white tracking-wider">
          NEW
        </span>
      )}
      <ReleaseTagBadge
        tag={props.release.tag ?? "お知らせ"}
        className="px-2 py-0 text-[11px]"
      />
      <time className="text-muted-foreground tabular-nums">
        {props.release.dateText}
      </time>
    </div>
  )
}

/**
 * お知らせのカード
 */
export function ReleaseCardView(props: Props) {
  const { release } = props
  const to = `/releases/${release.id}`

  if (props.variant === "featured") {
    return (
      <Link
        to={to}
        className="group grid overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-md md:grid-cols-[1.15fr_1fr]"
      >
        <ReleaseCover release={release} isPriority={props.isPriority} />
        <div className="flex flex-col justify-center gap-3 p-5 md:p-7">
          <ReleaseMeta release={release} />
          <h2 className="font-bold text-foreground text-xl leading-snug decoration-2 underline-offset-4 group-hover:underline md:text-2xl">
            {release.title}
          </h2>
          {release.excerpt && (
            <p className="line-clamp-3 text-foreground/80 text-sm leading-relaxed md:text-[15px]">
              {release.excerpt}
            </p>
          )}
        </div>
      </Link>
    )
  }

  if (props.variant === "compact") {
    return (
      <Link
        to={to}
        className="group flex gap-3 rounded-xl p-2 transition-colors hover:bg-muted/60"
      >
        <ReleaseCover
          release={release}
          className="w-28 shrink-0 rounded-lg md:w-32"
        />
        <div className="flex min-w-0 flex-col gap-1.5">
          <ReleaseMeta release={release} />
          <p className="line-clamp-2 font-semibold text-foreground text-sm leading-snug group-hover:underline">
            {release.title}
          </p>
        </div>
      </Link>
    )
  }

  return (
    <Link
      to={to}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-md"
    >
      <ReleaseCover release={release} isPriority={props.isPriority} />
      <div className="flex flex-1 flex-col gap-2 p-4">
        <ReleaseMeta release={release} />
        <h2 className="line-clamp-3 font-bold text-[15px] text-foreground leading-snug group-hover:underline">
          {release.title}
        </h2>
        {release.excerpt && (
          <p className="line-clamp-2 text-foreground/70 text-sm leading-relaxed">
            {release.excerpt}
          </p>
        )}
      </div>
    </Link>
  )
}
