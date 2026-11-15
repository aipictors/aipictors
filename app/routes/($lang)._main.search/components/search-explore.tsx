import {
  BookOpenIcon,
  BoxIcon,
  BrushIcon,
  CalendarDaysIcon,
  FileTextIcon,
  FlameIcon,
  HashIcon,
  HeartHandshakeIcon,
  LayersIcon,
  type LucideIcon,
  NetworkIcon,
  PartyPopperIcon,
  SparklesIcon,
  TrophyIcon,
  WandSparklesIcon,
} from "lucide-react"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import type { SearchLoaderData } from "~/routes/($lang)._main.search/search-loader.server"
import { toR18Path } from "~/utils/content-mode"
import { toResizedImageUrl } from "~/utils/resized-image-url"

/** 探すの入口（アプリの「探す」と同じ並び。Web にあるページだけ） */
const EXPLORE_LINKS: [LucideIcon, string, string, string][] = [
  [SparklesIcon, "新着", "New", "/new-works"],
  [HashIcon, "タグ", "Tags", "/tags"],
  [BrushIcon, "2D", "2D", "/posts/2d"],
  [WandSparklesIcon, "2.5D", "2.5D", "/posts/2.5d"],
  [BoxIcon, "3D", "3D", "/posts/3d"],
  [TrophyIcon, "ランキング", "Rankings", "/rankings"],
  [FlameIcon, "AI ランキング", "AI rankings", "/ai-rankings"],
  [HeartHandshakeIcon, "推しランキング", "Support rankings", "/coin-rankings"],
  [CalendarDaysIcon, "お題", "Themes", "/themes"],
  [PartyPopperIcon, "イベント", "Events", "/events"],
  [BookOpenIcon, "小説", "Novels", "/novels"],
  [FileTextIcon, "コラム", "Columns", "/notes"],
  [LayersIcon, "シリーズ", "Series", "/albums"],
  [NetworkIcon, "モデル", "Models", "/models"],
]

/**
 * 言葉を入れる前の「探す」（アプリと同じく 入口・人気のタグ・ランキング）
 */
export function SearchExplore(props: {
  data: SearchLoaderData
  pagePrefix: string
}) {
  const t = useTranslation()
  const { data, pagePrefix } = props

  return (
    <div className="space-y-7">
      <nav aria-label={t("探す", "Explore")} className="flex flex-wrap gap-1.5">
        {EXPLORE_LINKS.map(([Icon, ja, en, path]) => (
          <Link
            key={path}
            to={data.isSensitiveMode ? (toR18Path(path) ?? path) : path}
            className="inline-flex h-10 items-center gap-1.5 rounded-full border bg-card px-3.5 font-semibold text-sm transition-colors hover:bg-muted active:scale-95"
          >
            <Icon className="size-4 text-muted-foreground" />
            {t(ja, en)}
          </Link>
        ))}
      </nav>

      {data.popularTags.length > 0 && (
        <section aria-labelledby="search-popular-tags" className="space-y-3">
          <h2
            id="search-popular-tags"
            className="flex items-center gap-1.5 font-extrabold text-lg"
          >
            <HashIcon className="size-5 text-[#0170C8] dark:text-sky-400" />
            {t("人気のタグ", "Popular tags")}
          </h2>
          <ul className="-mx-3 grid auto-cols-[132px] grid-flow-col grid-rows-2 gap-2.5 overflow-x-auto overscroll-x-contain px-3 pb-1 [scrollbar-width:none] md:mx-0 md:auto-cols-[160px] md:px-0 [&::-webkit-scrollbar]:hidden">
            {data.popularTags.map((tag) => (
              <li key={tag.name}>
                <Link
                  to={`${pagePrefix}/tags/${encodeURIComponent(tag.name)}`}
                  className="group relative block h-[88px] overflow-hidden rounded-2xl bg-linear-to-br from-[#0170C8] via-[#6D5DF6] to-[#FF5C8A] md:h-[104px]"
                >
                  {tag.thumbnailUrl && (
                    <img
                      src={toResizedImageUrl(tag.thumbnailUrl, 320)}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  )}
                  <span className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />
                  <span className="absolute right-2 bottom-2 left-2 line-clamp-2 break-all font-extrabold text-sm text-white drop-shadow">
                    #{tag.name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {data.rankingWorks.length > 0 && (
        <section aria-labelledby="search-ranking" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2
              id="search-ranking"
              className="flex items-center gap-1.5 font-extrabold text-lg"
            >
              <TrophyIcon className="size-5 text-amber-500" />
              {t("デイリーランキング", "Daily ranking")}
            </h2>
            <Link
              to={`${pagePrefix}/rankings`}
              className="flex h-10 items-center px-1 font-semibold text-[#0170C8] text-sm dark:text-sky-400"
            >
              {t("すべて見る", "See all")}
            </Link>
          </div>
          <ol className="-mx-3 flex gap-3 overflow-x-auto overscroll-x-contain px-3 pb-1 [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden">
            {data.rankingWorks.map((work, index) => (
              <li key={work.id} className="w-[132px] shrink-0 md:w-[160px]">
                <Link to={`${pagePrefix}/posts/${work.id}`} className="block">
                  <span className="relative block aspect-[3/4] overflow-hidden rounded-[14px] bg-muted">
                    <img
                      src={toResizedImageUrl(work.smallThumbnailImageURL, 320)}
                      alt={t.workTitle(work.title, work.enTitle)}
                      loading="lazy"
                      decoding="async"
                      className="size-full object-cover"
                    />
                    <span className="absolute top-1.5 left-1.5 flex size-7 items-center justify-center rounded-full bg-black/60 font-black text-sm text-white">
                      {index + 1}
                    </span>
                  </span>
                  <span className="mt-1.5 block truncate font-bold text-sm">
                    {t.workTitle(work.title, work.enTitle)}
                  </span>
                  <span className="block truncate text-muted-foreground text-xs">
                    {work.user?.name}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  )
}
