import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import type { SearchLoaderData } from "~/routes/($lang)._main.search/search-loader.server"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

/**
 * 検索の右カラム（人気のタグ、人気ランキング）
 */
export function SearchSidebar(props: {
  data: SearchLoaderData
  pagePrefix: string
}) {
  const t = useTranslation()
  const { data, pagePrefix } = props

  return (
    <aside className="hidden space-y-10 xl:block">
      <section>
        <h2 className="mb-4 font-bold text-lg">
          {t("人気のイラストタグ", "Popular Illustration Tags")}
        </h2>
        <div className="flex flex-wrap gap-2">
          {data.popularTags.map((tag) => (
            <Link
              key={tag.name}
              to={`${pagePrefix}/tags/${encodeURIComponent(tag.name)}`}
              className="inline-flex h-8 items-center rounded-full border px-3 font-medium text-sm transition-colors hover:border-foreground/40"
            >
              #{tag.name}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-bold text-lg">
          {t("人気ランキング", "Popular Ranking")}
        </h2>
        <div className="space-y-4">
          {data.rankingWorks.map((work, index) => (
            <Link
              key={work.id}
              to={`${pagePrefix}/posts/${work.id}`}
              className="flex items-start gap-3"
            >
              <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-orange-400 font-bold text-black text-sm">
                {index + 1}
              </div>

              <img
                src={work.smallThumbnailImageURL}
                alt={t(work.title, work.enTitle || undefined)}
                loading="lazy"
                className="size-14 shrink-0 rounded-md object-cover"
              />

              <div className="min-w-0">
                <p className="line-clamp-2 font-semibold text-sm leading-snug">
                  {t(work.title, work.enTitle || undefined)}
                </p>
                <div className="mt-1 flex items-center gap-1.5 text-muted-foreground text-xs">
                  <Avatar className="size-5">
                    <AvatarImage
                      src={withIconUrlFallback(work.user?.iconUrl)}
                      alt={work.user?.name ?? ""}
                    />
                    <AvatarFallback>
                      {work.user?.name?.slice(0, 1) ?? "?"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate">{work.user?.name}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </aside>
  )
}
