import { Heart } from "lucide-react"
import { CroppedWorkSquare } from "~/components/cropped-work-square"
import { LikeButton } from "~/components/like-button"
import { ResponsivePagination } from "~/components/responsive-pagination"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import type { SearchLoaderData } from "~/routes/($lang)._main.search/search-loader.server"
import type { SearchFilterChange } from "~/routes/($lang)._main.search/utils/search-filters"
import {
  RESULTS_LIMIT,
  TEXT_SEARCH_MAX_PAGE,
} from "~/routes/($lang)._main.search/utils/search-filters"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

/**
 * 検索結果の一覧（キーワードがなければ人気のタグ）
 */
export function SearchResults(props: {
  data: SearchLoaderData
  navigateToSearch: (tagName?: string | null, next?: SearchFilterChange) => void
  pagePrefix: string
}) {
  const t = useTranslation()
  const { data, navigateToSearch, pagePrefix } = props
  const hasResults = data.searchQuery !== null

  return hasResults ? (
    data.works.length > 0 ? (
      <>
        <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 md:gap-x-4 lg:grid-cols-4 2xl:grid-cols-5">
          {data.works.map((work) => (
            <article key={work.id} className="min-w-0">
              <div className="group relative">
                <CroppedWorkSquare
                  title={t(work.title, work.enTitle || undefined)}
                  workId={work.id}
                  imageUrl={work.smallThumbnailImageURL}
                  thumbnailImagePosition={work.thumbnailImagePosition ?? 0}
                  size="auto"
                  imageWidth={work.smallThumbnailImageWidth}
                  imageHeight={work.smallThumbnailImageHeight}
                  subWorksCount={work.subWorksCount}
                  commentsCount={work.commentsCount}
                  isPromptPublic={
                    work.promptAccessType === "PUBLIC" || work.isGeneration
                  }
                  hasVideoUrl={Boolean(work.url)}
                  isGeneration={work.isGeneration}
                />

                <div className="absolute right-2 bottom-2 z-10">
                  <LikeButton
                    size={48}
                    targetWorkId={work.id}
                    targetWorkOwnerUserId={work.user?.id ?? ""}
                    defaultLiked={work.isLiked}
                    defaultLikedCount={0}
                    likedCount={work.likesCount}
                    isBackgroundNone={true}
                    strokeWidth={2}
                  />
                </div>
              </div>

              <div className="mt-2 flex items-start justify-between gap-2">
                <Link
                  to={`${pagePrefix}/posts/${work.id}`}
                  className="line-clamp-2 flex-1 font-semibold text-sm leading-snug hover:underline"
                >
                  {t(work.title, work.enTitle || undefined)}
                </Link>

                <div className="flex shrink-0 items-center gap-1 text-muted-foreground text-xs">
                  <Heart className="size-3.5" />
                  <span>{work.likesCount}</span>
                </div>
              </div>

              {work.user && (
                <Link
                  to={`${pagePrefix}/users/${work.user.id}`}
                  className="mt-2 flex items-center gap-2"
                >
                  <Avatar className="size-6">
                    <AvatarImage
                      src={withIconUrlFallback(work.user.iconUrl)}
                      alt={work.user.name}
                    />
                    <AvatarFallback>
                      {work.user.name.slice(0, 1)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate text-muted-foreground text-xs md:text-sm">
                    {work.user.name}
                  </span>
                </Link>
              )}
            </article>
          ))}
        </div>

        {data.worksCount > RESULTS_LIMIT && (
          <div className="mt-10 flex justify-center">
            <ResponsivePagination
              maxCount={
                data.mode === "text"
                  ? Math.min(
                      data.worksCount,
                      (TEXT_SEARCH_MAX_PAGE + 1) * RESULTS_LIMIT,
                    )
                  : data.worksCount
              }
              perPage={RESULTS_LIMIT}
              currentPage={data.currentPage}
              onPageChange={(page) => {
                navigateToSearch(data.searchQuery, { page })
              }}
              isActiveButtonStyle
            />
          </div>
        )}
      </>
    ) : (
      <div className="rounded-md border bg-muted/20 px-6 py-16 text-center">
        <p className="text-lg text-muted-foreground">
          {t("該当する作品が見つかりませんでした", "No works were found")}
        </p>
      </div>
    )
  ) : (
    <section className="rounded-2xl border bg-muted/20 p-5 md:p-7">
      <h2 className="mb-4 font-bold text-lg">
        {t("人気のタグ", "Popular tags")}
      </h2>
      <div className="flex flex-wrap gap-2">
        {data.popularTags.map((tag) => (
          <Link
            key={tag.name}
            to={`${pagePrefix}/tags/${encodeURIComponent(tag.name)}`}
            className="inline-flex h-9 items-center rounded-full border bg-background px-4 font-medium text-sm transition-colors hover:border-foreground/40"
          >
            #{tag.name}
          </Link>
        ))}
      </div>
    </section>
  )
}
