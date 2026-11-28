import { Heart } from "lucide-react"
import { CroppedWorkSquare } from "~/components/cropped-work-square"
import { LikeButton } from "~/components/like-button"
import { ResponsivePagination } from "~/components/responsive-pagination"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { WorkViewerDialog } from "~/components/work/lazy-work-viewer-dialog"
import { useGridLayout } from "~/hooks/use-grid-layout"
import { useLayoutVariant } from "~/hooks/use-layout-variant"
import { useTranslation } from "~/hooks/use-translation"
import { useWorkDialogUrl } from "~/hooks/use-work-dialog-url"
import { Link } from "~/lib/app/locale-router"
import { isPlainLeftClick } from "~/lib/is-plain-left-click"
import { cn } from "~/lib/utils"
import type { SearchLoaderData } from "~/routes/($lang)._main.search/search-loader.server"
import type { SearchFilterChange } from "~/routes/($lang)._main.search/utils/search-filters"
import {
  RESULTS_LIMIT,
  TEXT_SEARCH_MAX_PAGE,
} from "~/routes/($lang)._main.search/utils/search-filters"
import {
  splitMasonryColumns,
  toMasonryAspectRatio,
} from "~/utils/split-masonry-columns"
import { toIconImageUrl } from "~/utils/with-icon-url-fallback"

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
  const { gridLayout } = useGridLayout()
  const { showDesktop, showMobile } = useLayoutVariant()
  // スマホは並べ方の設定が「元の比率」（スマホの既定）ならアプリと同じ石垣状
  const isMobileMasonry = gridLayout === "justified"
  // R18 の検索（/r/search）だけ、作品を /r トップと同じダイアログで開く（URL に ?work= が付き、戻るで閉じる）。
  // 検索結果から作品ページへ移ると、戻ったときに検索をやり直して離脱が多かった（/r/search の quick back 64%）。
  // 全年齢の /search は R18 で 1 週間様子を見てから広げるので、これまでどおり作品ページへ移る。
  // リンクは残すので、新しいタブで開く・直リンク・検索エンジンはこれまでどおり作品ページへ行く
  const isWorkDialogEnabled = pagePrefix === "/r"
  const workDialog = useWorkDialogUrl()
  const onClickWorkLink = (
    event: React.MouseEvent<HTMLAnchorElement>,
    workId: string,
  ) => {
    if (!isWorkDialogEnabled || !isPlainLeftClick(event)) return
    event.preventDefault()
    workDialog.openDialog(workId)
  }

  const renderCard = (
    work: SearchLoaderData["works"][number],
    aspectRatio?: number,
  ) => (
    <article key={work.id} className="min-w-0">
      <div className="group relative">
        <CroppedWorkSquare
          title={t.workTitle(work.title, work.enTitle)}
          workId={work.id}
          imageUrl={work.smallThumbnailImageURL}
          thumbnailImagePosition={work.thumbnailImagePosition ?? 0}
          size="auto"
          aspectRatio={aspectRatio}
          imageWidth={work.smallThumbnailImageWidth}
          imageHeight={work.smallThumbnailImageHeight}
          subWorksCount={work.subWorksCount}
          commentsCount={work.commentsCount}
          isPromptPublic={
            work.promptAccessType === "PUBLIC" || work.isGeneration
          }
          hasVideoUrl={Boolean(work.url)}
          isGeneration={work.isGeneration}
          onLinkClick={isWorkDialogEnabled ? workDialog.openDialog : undefined}
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
          onClick={(event) => onClickWorkLink(event, work.id)}
        >
          {t.workTitle(work.title, work.enTitle)}
        </Link>

        <div
          data-list-like-count
          className="flex shrink-0 items-center gap-1 text-muted-foreground text-xs"
        >
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
              src={toIconImageUrl(work.user.iconUrl)}
              alt={work.user.name}
            />
            <AvatarFallback>{work.user.name.slice(0, 1)}</AvatarFallback>
          </Avatar>
          <span className="truncate text-muted-foreground text-xs md:text-sm">
            {work.user.name}
          </span>
        </Link>
      )}
    </article>
  )

  return hasResults ? (
    data.works.length > 0 ? (
      <>
        {showMobile && isMobileMasonry ? (
          <div className="grid grid-cols-2 items-start gap-x-2.5 md:hidden">
            {splitMasonryColumns(
              data.works,
              2,
              (work) =>
                toMasonryAspectRatio(
                  work.smallThumbnailImageWidth,
                  work.smallThumbnailImageHeight,
                ),
              0.3,
            ).map((column, columnIndex) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: 列の位置そのものが key
                key={columnIndex}
                className="flex min-w-0 flex-col gap-y-4"
              >
                {column.map(({ item }) =>
                  renderCard(
                    item,
                    toMasonryAspectRatio(
                      item.smallThumbnailImageWidth,
                      item.smallThumbnailImageHeight,
                    ),
                  ),
                )}
              </div>
            ))}
          </div>
        ) : null}
        {(showDesktop || !isMobileMasonry) && (
          <div
            className={cn(
              "grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 md:gap-x-4 lg:grid-cols-4 2xl:grid-cols-5",
              isMobileMasonry && "max-md:hidden",
            )}
          >
            {data.works.map((work) => renderCard(work))}
          </div>
        )}

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

        {isWorkDialogEnabled && workDialog.isOpen && workDialog.workId && (
          <WorkViewerDialog
            works={data.works}
            startWorkId={workDialog.workId}
            onClose={workDialog.closeDialog}
            hasNextPage={false}
            isLoadingMore={false}
          />
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
