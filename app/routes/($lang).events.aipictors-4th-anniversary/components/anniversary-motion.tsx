import { ChevronLeftIcon, ChevronRightIcon, HeartIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { cn } from "~/lib/utils"
import type { Anniversary4thGalleryWork } from "~/routes/($lang).events.aipictors-4th-anniversary/anniversary-4th-gallery"
import { formatNumber } from "~/routes/($lang).events.aipictors-4th-anniversary/components/anniversary-charts"

/**
 * 特設ページのアニメーション（CSS の transition / keyframes と IntersectionObserver だけ。
 * 「視差効果を減らす」の設定では動かさずにそのまま出す）
 */

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches

/**
 * 画面に入ったら true（一度だけ）。サーバーと最初の描画では true にしておき、
 * 画面より下にある要素だけを隠してから出す（JS が動かなくても中身は見える）
 */
export function useRevealOnScroll<T extends HTMLElement>(rootMargin = "0px") {
  const ref = useRef<T>(null)
  const [isShown, setIsShown] = useState(true)

  useEffect(() => {
    const element = ref.current
    if (element === null || prefersReducedMotion()) return
    if (typeof IntersectionObserver === "undefined") return
    if (element.getBoundingClientRect().top < window.innerHeight * 0.9) return
    setIsShown(false)
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsShown(true)
          observer.disconnect()
        }
      },
      { rootMargin, threshold: 0.12 },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [rootMargin])

  return { ref, isShown }
}

const REVEAL_HIDDEN = {
  up: "translate-y-10 opacity-0",
  left: "-translate-x-10 opacity-0",
  right: "translate-x-10 opacity-0",
  zoom: "scale-90 opacity-0",
  grow: "scale-y-0 opacity-0",
} as const

/** スクロールして画面に入ると、ふわっと出てくる */
export function Reveal(props: {
  children: React.ReactNode
  className?: string
  from?: keyof typeof REVEAL_HIDDEN
  /** 出てくるまでの遅れ（ms）。並べたものを順に出すとき */
  delay?: number
}) {
  const { ref, isShown } = useRevealOnScroll<HTMLDivElement>()
  const from = props.from ?? "up"
  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700 ease-out motion-reduce:transition-none",
        from === "grow" && "origin-bottom",
        !isShown && REVEAL_HIDDEN[from],
        props.className,
      )}
      style={{ transitionDelay: isShown ? `${props.delay ?? 0}ms` : "0ms" }}
    >
      {props.children}
    </div>
  )
}

/** 画面に入ったら 0 から数え上げる数字（サーバーでは最後の数を出す） */
export function CountUp(props: {
  value: number
  format?: (value: number) => string
  durationMs?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const [current, setCurrent] = useState(props.value)
  const format = props.format ?? formatNumber

  useEffect(() => {
    const element = ref.current
    if (element === null || prefersReducedMotion()) return
    if (typeof IntersectionObserver === "undefined") return
    let frame = 0
    const target = props.value
    const duration = props.durationMs ?? 1800
    setCurrent(0)
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        observer.disconnect()
        const start = performance.now()
        const tick = (now: number) => {
          const progress = Math.min(1, (now - start) / duration)
          // 最後にゆっくり止まる
          const eased = 1 - (1 - progress) ** 4
          setCurrent(Math.round(target * eased))
          if (progress < 1) frame = requestAnimationFrame(tick)
        }
        frame = requestAnimationFrame(tick)
      },
      { threshold: 0.4 },
    )
    observer.observe(element)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [props.value, props.durationMs])

  return (
    <span ref={ref} className="tabular-nums">
      {format(current)}
    </span>
  )
}

/** ページの上に出るスクロールの進み具合 */
export function ScrollProgress() {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    let frame = 0
    const update = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight
        setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0)
      })
    }
    update()
    window.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    return () => {
      window.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
      cancelAnimationFrame(frame)
    }
  }, [])
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-1 origin-left bg-gradient-to-r from-violet-500 via-fuchsia-500 to-amber-400"
      style={{ transform: `scaleX(${progress})` }}
    />
  )
}

/**
 * ヒーローの背景: 斜めに傾けた作品の列が上下に流れ続ける壁
 */
export function HeroWorkWall(props: { works: Anniversary4thGalleryWork[] }) {
  const columnCount = 7
  const columns = Array.from({ length: columnCount }, (_, column) =>
    props.works.filter((_, index) => index % columnCount === column),
  )
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden [perspective:1200px]"
    >
      <div className="-inset-x-1/4 -top-1/3 absolute bottom-[-33%] flex gap-3 opacity-60 [transform:rotateX(18deg)_rotateZ(-12deg)] md:gap-4">
        {columns.map((works, column) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: 列の並びは変わらない
            key={column}
            className={cn(
              "flex w-28 shrink-0 flex-col gap-3 md:w-40 md:gap-4",
              column % 2 === 0
                ? "animate-[anniv4-wall-up_70s_linear_infinite]"
                : "animate-[anniv4-wall-down_80s_linear_infinite]",
              "motion-reduce:animate-none",
            )}
          >
            {[...works, ...works].map((work, index) => (
              <img
                key={`${work.id}-${index}`}
                src={work.thumbnail}
                alt=""
                loading={index < 4 ? "eager" : "lazy"}
                decoding="async"
                className="aspect-[3/4] w-full rounded-xl object-cover shadow-lg"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/** 降ってくる紙吹雪とキラキラ（CSS だけ） */
export function FallingConfetti(props: { count?: number }) {
  const count = props.count ?? 36
  const colors = [
    "#fde047",
    "#a5f3fc",
    "#f9a8d4",
    "#bbf7d0",
    "#ffffff",
    "#c4b5fd",
  ]
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden motion-reduce:hidden"
    >
      {Array.from({ length: count }, (_, index) => {
        const isStar = index % 5 === 0
        return (
          <span
            // biome-ignore lint/suspicious/noArrayIndexKey: 飾りなので並びは変わらない
            key={index}
            className={cn(
              "absolute top-[-5%] block animate-[anniv4-fall_linear_infinite]",
              isStar ? "text-base md:text-xl" : "h-3 w-1.5 rounded-sm",
            )}
            style={{
              left: `${(index * 37 + 11) % 100}%`,
              animationDuration: `${7 + ((index * 13) % 9)}s`,
              animationDelay: `-${(index * 7) % 11}s`,
              backgroundColor: isStar
                ? undefined
                : colors[index % colors.length],
              color: isStar ? colors[index % colors.length] : undefined,
            }}
          >
            {isStar ? "✦" : null}
          </span>
        )
      })}
    </div>
  )
}

/**
 * 横に流れる作品の帯を何段か。段ごとに向きと速さを変える。触れている間は止まる
 */
export function WorkMarqueeRows(props: {
  works: Anniversary4thGalleryWork[]
  rows?: number
}) {
  const rows = props.rows ?? 3
  if (props.works.length === 0) return null
  return (
    <div className="group/marquee space-y-3 overflow-hidden py-4">
      {Array.from({ length: rows }, (_, row) => {
        const works = props.works.filter((_, index) => index % rows === row)
        const loop = [...works, ...works]
        return (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: 段の並びは変わらない
            key={row}
            className={cn(
              "flex w-max gap-3 motion-reduce:animate-none group-hover/marquee:[animation-play-state:paused]",
              row % 2 === 0
                ? "animate-[anniv4-marquee_var(--speed)_linear_infinite]"
                : "animate-[anniv4-marquee-reverse_var(--speed)_linear_infinite]",
            )}
            style={{ "--speed": `${90 + row * 25}s` } as React.CSSProperties}
          >
            {loop.map((work, index) => (
              <Link
                key={`${work.id}-${index}`}
                to={`/posts/${work.id}`}
                aria-hidden={index >= works.length}
                tabIndex={index >= works.length ? -1 : undefined}
                className="group relative block h-28 w-24 shrink-0 overflow-hidden rounded-xl ring-1 ring-white/15 transition hover:ring-2 hover:ring-white md:h-44 md:w-36"
              >
                <img
                  src={work.thumbnail}
                  alt={work.title}
                  loading="lazy"
                  decoding="async"
                  className="size-full object-cover transition duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/80 to-transparent p-1.5 text-[10px] text-white transition group-hover:translate-y-0 md:text-xs">
                  <div className="truncate font-bold">{work.title}</div>
                  <div className="truncate text-white/75">{work.userName}</div>
                </div>
              </Link>
            ))}
          </div>
        )
      })}
    </div>
  )
}

export type TimelineMilestone = {
  month: string
  label: string
  enLabel: string
}

/**
 * 月ごとのいちばん人気の作品を横に並べたタイムライン（スマホはスワイプ、PC は矢印とホイール）
 */
export function MonthlyTimeline(props: {
  items: { month: string; work: Anniversary4thGalleryWork }[]
  milestones: TimelineMilestone[]
}) {
  const t = useTranslation()
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)

  const scrollBy = (direction: 1 | -1) => {
    const scroller = scrollerRef.current
    if (scroller === null) return
    scroller.scrollBy({
      left: direction * scroller.clientWidth * 0.8,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    })
  }

  const onScroll = () => {
    const scroller = scrollerRef.current
    if (scroller === null) return
    const max = scroller.scrollWidth - scroller.clientWidth
    setProgress(max > 0 ? scroller.scrollLeft / max : 0)
  }

  const milestonesByMonth = new Map<string, TimelineMilestone[]>()
  for (const milestone of props.milestones) {
    milestonesByMonth.set(milestone.month, [
      ...(milestonesByMonth.get(milestone.month) ?? []),
      milestone,
    ])
  }

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        onScroll={onScroll}
        className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-4 pt-10 pb-6 [scrollbar-width:none] motion-reduce:scroll-auto [&::-webkit-scrollbar]:hidden"
      >
        {props.items.map((item, index) => {
          const [year, month] = item.month.split("-")
          const isNewYear = month === "01" || index === 0
          const milestones = milestonesByMonth.get(item.month) ?? []
          return (
            <div
              key={item.month}
              className="relative w-40 shrink-0 snap-start md:w-52"
            >
              {isNewYear && (
                <span className="-top-9 absolute left-0 bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text font-black text-3xl text-transparent">
                  {year}
                </span>
              )}
              <div className="mb-2 flex items-center gap-2">
                <span className="size-3 shrink-0 rounded-full bg-gradient-to-br from-fuchsia-500 to-violet-600 ring-4 ring-fuchsia-500/20" />
                <span className="h-0.5 flex-1 bg-gradient-to-r from-fuchsia-500/60 to-violet-500/20" />
              </div>
              <div className="font-bold text-muted-foreground text-xs">
                {t(`${year}年${Number(month)}月`, `${month}/${year}`)}
              </div>
              <Link
                to={`/posts/${item.work.id}`}
                className="group relative mt-1 block aspect-[3/4] overflow-hidden rounded-2xl bg-muted shadow-md"
              >
                <img
                  src={item.work.largeThumbnail ?? item.work.thumbnail}
                  alt={item.work.title}
                  loading="lazy"
                  decoding="async"
                  className="size-full object-cover transition duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-2 text-white">
                  <div className="truncate font-bold text-sm">
                    {item.work.title}
                  </div>
                  <div className="flex items-center justify-between gap-2 text-[11px] text-white/80">
                    <span className="truncate">{item.work.userName}</span>
                    <span className="flex shrink-0 items-center gap-0.5 tabular-nums">
                      <HeartIcon className="size-3 fill-current" />
                      {item.work.likes}
                    </span>
                  </div>
                </div>
              </Link>
              {milestones.map((milestone) => (
                <div
                  key={milestone.label}
                  className="mt-2 rounded-xl border border-amber-300 bg-amber-50 px-2 py-1 font-bold text-amber-800 text-xs dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-300"
                >
                  🎉 {t(milestone.label, milestone.enLabel)}
                </div>
              ))}
            </div>
          )
        })}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          aria-label={t("前へ", "Previous")}
          className="rounded-full border bg-card p-2 shadow-sm transition hover:bg-muted"
        >
          <ChevronLeftIcon className="size-5" />
        </button>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-pink-500"
            style={{ width: `${Math.max(4, progress * 100)}%` }}
          />
        </div>
        <button
          type="button"
          onClick={() => scrollBy(1)}
          aria-label={t("次へ", "Next")}
          className="rounded-full border bg-card p-2 shadow-sm transition hover:bg-muted"
        >
          <ChevronRightIcon className="size-5" />
        </button>
      </div>
    </div>
  )
}

/** 作品をレンガのように並べ、順にふわっと出す */
export function WorkMasonry(props: { works: Anniversary4thGalleryWork[] }) {
  return (
    <div className="columns-2 gap-2 sm:columns-3 lg:columns-4 [&>*]:mb-2">
      {props.works.map((work, index) => (
        <Reveal key={work.id} from="zoom" delay={(index % 8) * 60}>
          <Link
            to={`/posts/${work.id}`}
            className="group relative block break-inside-avoid overflow-hidden rounded-xl bg-muted"
          >
            <img
              src={work.thumbnail}
              alt={work.title}
              loading="lazy"
              decoding="async"
              className="w-full transition duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/75 via-transparent to-transparent p-2 text-white opacity-100 transition md:opacity-0 md:group-hover:opacity-100">
              <div className="truncate font-bold text-xs">{work.title}</div>
              <div className="flex items-center justify-between gap-2 text-[11px] text-white/80">
                <span className="truncate">{work.userName}</span>
                <span className="flex shrink-0 items-center gap-0.5 tabular-nums">
                  <HeartIcon className="size-3 fill-current" />
                  {work.likes}
                </span>
              </div>
            </div>
          </Link>
        </Reveal>
      ))}
    </div>
  )
}

/** ページで使う keyframes（Tailwind の設定を変えずにこのページだけで持つ） */
export function AnniversaryKeyframes() {
  return (
    <style>
      {[
        "@keyframes anniv4-marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}",
        "@keyframes anniv4-marquee-reverse{from{transform:translateX(-50%)}to{transform:translateX(0)}}",
        "@keyframes anniv4-wall-up{from{transform:translateY(0)}to{transform:translateY(-50%)}}",
        "@keyframes anniv4-wall-down{from{transform:translateY(-50%)}to{transform:translateY(0)}}",
        "@keyframes anniv4-fall{0%{transform:translateY(0) rotate(0deg);opacity:0}10%{opacity:.9}100%{transform:translateY(110vh) rotate(720deg);opacity:0}}",
        "@keyframes anniv4-float{0%,100%{transform:translateY(0) rotate(-1deg)}50%{transform:translateY(-14px) rotate(1deg)}}",
        "@keyframes anniv4-shine{from{background-position:0% 50%}to{background-position:200% 50%}}",
        "@keyframes anniv4-pop{0%{transform:scale(.6) translateY(30px);opacity:0}70%{transform:scale(1.05);opacity:1}100%{transform:scale(1) translateY(0);opacity:1}}",
        "@keyframes anniv4-spin{to{transform:rotate(360deg)}}",
      ].join("")}
    </style>
  )
}
