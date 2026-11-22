import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { SupportTierChip } from "~/components/support-super-chat"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { cn } from "~/lib/utils"
import { getSupportTier, pickPinnedSupports } from "~/utils/support-tier"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

type StripComment = {
  id: string
  createdAt: number
  text?: string | null
  support?: {
    freeCoinAmount: number
    premiumCoinAmount: number
    totalPt: number
  } | null
  user?: {
    id?: string | null
    name?: string | null
    iconUrl?: string | null
  } | null
}

/**
 * コメント欄の上の「応援の帯」。推し付きコメントを時間で消さずにいつも出し、課金額の多い順に左から並べる
 * 読み込んだコメントだけで決める。横にスクロールでき（PC はホイールと左右のボタンでも）、押すと推した人のページへ
 */
export function WorkCommentSupportStrip(props: { comments: StripComment[] }) {
  const t = useTranslation()
  const pinned = pickPinnedSupports(props.comments)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(false)

  const update = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 1)
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    // 縦のホイールを横のスクロールに変える（横に動けるあいだだけ。端に着いたらページの縦スクロールに戻す）
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return
      const max = el.scrollWidth - el.clientWidth
      if (max <= 0) return
      const next = el.scrollLeft + event.deltaY
      if (
        (event.deltaY < 0 && el.scrollLeft <= 0) ||
        (event.deltaY > 0 && el.scrollLeft >= max)
      )
        return
      event.preventDefault()
      el.scrollLeft = Math.max(0, Math.min(max, next))
    }
    el.addEventListener("wheel", onWheel, { passive: false })
    return () => {
      observer.disconnect()
      el.removeEventListener("wheel", onWheel)
    }
  }, [update, pinned.length])

  if (pinned.length === 0) return null

  const scrollByPage = (direction: 1 | -1) => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({
      left: direction * Math.max(160, el.clientWidth * 0.8),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    })
  }

  return (
    <section aria-label={t("推し", "Support")} className="group -mx-1 relative">
      <div
        ref={scrollRef}
        onScroll={update}
        className="flex snap-x gap-2 overflow-x-auto overscroll-x-contain scroll-smooth px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {pinned.map((comment) => {
          if (!comment.support) return null
          const tier = getSupportTier(comment.support)
          const userId = comment.user?.id
          const className = cn(
            "flex max-w-60 shrink-0 snap-start items-center gap-2 rounded-full py-1 pr-1 pl-1 ring-1 transition-opacity hover:opacity-80",
            tier?.bodyClassName,
          )
          const body = (
            <>
              <img
                src={withIconUrlFallback(comment.user?.iconUrl)}
                alt=""
                className="size-7 shrink-0 rounded-full object-cover"
                loading="lazy"
                draggable={false}
              />
              <span className="min-w-0 truncate font-medium text-xs">
                {comment.user?.name ?? ""}
              </span>
              <SupportTierChip support={comment.support} className="shrink-0" />
            </>
          )
          return userId ? (
            <Link
              key={comment.id}
              to={`/users/${userId}`}
              title={comment.user?.name ?? undefined}
              className={className}
            >
              {body}
            </Link>
          ) : (
            <span key={comment.id} className={className}>
              {body}
            </span>
          )
        })}
      </div>
      {/* 端が隠れているときだけ、ぼかしと左右のボタンを出す（ボタンはマウスのある端末だけ） */}
      {canLeft && (
        <>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-background to-transparent" />
          <button
            type="button"
            aria-label={t("前へ", "Previous")}
            onClick={() => scrollByPage(-1)}
            className="-translate-y-1/2 absolute top-1/2 left-0 hidden size-7 items-center justify-center rounded-full border bg-background/90 shadow-sm hover:bg-accent [@media(hover:hover)]:flex"
          >
            <ChevronLeftIcon className="size-4" />
          </button>
        </>
      )}
      {canRight && (
        <>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent" />
          <button
            type="button"
            aria-label={t("次へ", "Next")}
            onClick={() => scrollByPage(1)}
            className="-translate-y-1/2 absolute top-1/2 right-0 hidden size-7 items-center justify-center rounded-full border bg-background/90 shadow-sm hover:bg-accent [@media(hover:hover)]:flex"
          >
            <ChevronRightIcon className="size-4" />
          </button>
        </>
      )}
    </section>
  )
}
