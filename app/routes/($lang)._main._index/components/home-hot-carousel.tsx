import { type FragmentOf, graphql } from "gql.tada"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  FlameIcon,
  HeartIcon,
} from "lucide-react"
import { useRef } from "react"
import { OptimizedImage } from "~/components/optimized-image"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { cn } from "~/lib/utils"
import { toResizedImageSrcSet } from "~/utils/resized-image-url"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

export const HomeHotWorkFragment = graphql(
  `fragment HomeHotWork on WorkNode @_unmask {
    id
    title
    enTitle
    rating
    likesCount
    largeThumbnailImageURL
    largeThumbnailImageWidth
    largeThumbnailImageHeight
    user {
      id
      name
      iconUrl
    }
  }`,
)

/** カルーセルに出す件数（アプリと同じ） */
export const HOME_HOT_WORKS_COUNT = 10

const formatCount = (value: number) =>
  value >= 10000
    ? `${(value / 10000).toFixed(1)}万`
    : value.toLocaleString("ja-JP")

/**
 * いま人気（アプリのホームと同じ大きなカルーセル）
 *
 * 横にスワイプ（スクロールのスナップ）。自動で送らない（サーバーとブラウザの最初の描画を同じにするため、動きは操作したときだけ）
 */
export function HomeHotCarousel(props: {
  works: FragmentOf<typeof HomeHotWorkFragment>[]
}) {
  const t = useTranslation()
  const scrollerRef = useRef<HTMLDivElement>(null)

  if (props.works.length === 0) return null

  const scrollByCard = (direction: 1 | -1) => {
    const scroller = scrollerRef.current
    if (!scroller) return
    const card = scroller.querySelector<HTMLElement>("[data-hot-card]")
    const step = (card?.offsetWidth ?? scroller.clientWidth * 0.8) + 12
    scroller.scrollBy({ left: step * direction, behavior: "smooth" })
  }

  return (
    <section aria-label={t("いま人気", "Trending now")} className="space-y-2.5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-1.5 font-extrabold text-lg">
          <FlameIcon className="size-5 fill-[#FF6A3D]/20 text-[#FF6A3D]" />
          {t("いま人気", "Trending now")}
        </h2>
        <div className="hidden items-center gap-1.5 md:flex">
          <button
            type="button"
            onClick={() => scrollByCard(-1)}
            aria-label={t("前へ", "Previous")}
            className="flex size-9 items-center justify-center rounded-full bg-muted transition-colors hover:bg-muted/70"
          >
            <ChevronLeftIcon className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => scrollByCard(1)}
            aria-label={t("次へ", "Next")}
            className="flex size-9 items-center justify-center rounded-full bg-muted transition-colors hover:bg-muted/70"
          >
            <ChevronRightIcon className="size-5" />
          </button>
        </div>
      </div>
      <div
        ref={scrollerRef}
        className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-4 pb-1 [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {props.works.map((work, index) => {
          const title = t.workTitle(work.title, work.enTitle)
          const isTop = index < 3
          return (
            <Link
              key={work.id}
              data-hot-card
              to={`/posts/${work.id}`}
              className="group relative aspect-[4/5] w-[82%] shrink-0 snap-center overflow-hidden rounded-3xl bg-muted active:scale-[0.98] motion-reduce:transform-none sm:w-[46%] md:snap-start lg:w-[31%] xl:w-[23.5%]"
            >
              <OptimizedImage
                src={work.largeThumbnailImageURL}
                alt={title}
                loading={index === 0 ? "eager" : "lazy"}
                fetchPriority={index === 0 ? "high" : "low"}
                srcSet={toResizedImageSrcSet(work.largeThumbnailImageURL, {
                  minWidth: 320,
                  maxWidth: work.largeThumbnailImageWidth ?? undefined,
                })}
                sizes="(min-width: 1280px) 260px, (min-width: 1024px) 280px, (min-width: 640px) 46vw, 82vw"
                width={work.largeThumbnailImageWidth ?? undefined}
                height={work.largeThumbnailImageHeight ?? undefined}
                className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent from-55% to-black/80" />
              <span
                className={cn(
                  "absolute top-3 left-3 rounded-full px-2.5 py-1 font-black text-white text-xs tabular-nums backdrop-blur-sm",
                  isTop ? "bg-[#E2A21B]/90" : "bg-black/50",
                )}
              >
                #{index + 1}
              </span>
              {work.rating === "R15" && (
                <span className="absolute top-3 right-3 rounded-full bg-amber-500/90 px-2 py-0.5 font-bold text-[10px] text-white">
                  R15
                </span>
              )}
              <div className="absolute inset-x-4 bottom-3.5 space-y-1.5 text-white">
                <p className="line-clamp-1 font-extrabold text-lg leading-tight drop-shadow">
                  {title}
                </p>
                <div className="flex items-center gap-1.5 text-[13px]">
                  {work.user && (
                    <>
                      <img
                        src={withIconUrlFallback(work.user.iconUrl)}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="size-[22px] shrink-0 rounded-full bg-white/20 object-cover"
                      />
                      <span className="min-w-0 flex-1 truncate text-white/80">
                        {work.user.name}
                      </span>
                    </>
                  )}
                  <HeartIcon className="ml-auto size-4 shrink-0 fill-pink-500 text-pink-500" />
                  <span className="font-bold tabular-nums">
                    {formatCount(work.likesCount)}
                  </span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
