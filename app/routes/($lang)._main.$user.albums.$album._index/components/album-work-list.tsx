import { Link, useNavigation, useSearchParams } from "@remix-run/react"
import { type FragmentOf, graphql } from "gql.tada"
import type React from "react"
import { CroppedWorkSquare } from "~/components/cropped-work-square"
import { LikeButton } from "~/components/like-button"
import { LinkPagination } from "~/components/link-pagination"
import { MasonryWorkGrid } from "~/components/masonry-work-grid"
import { PhotoAlbumWorkFragment } from "~/components/responsive-photo-works-album"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import {
  ALBUM_WORKS_PER_PAGE,
  type AlbumWorkOrder,
  isAdultWork,
} from "~/routes/($lang)._main.$user.albums.$album._index/album-page-utils"
import type { SortType } from "~/types/sort-type"

type Props = {
  works: FragmentOf<typeof AlbumWorkListItemFragment>[]
  maxCount: number
  page: number
  orderBy: AlbumWorkOrder
  sort: SortType
  isAdultSeries: boolean
}

type ViewMode = "square" | "natural"

const toViewMode = (value: string | null): ViewMode => {
  return value === "natural" ? "natural" : "square"
}

const toSelectOrderValue = (orderBy: AlbumWorkOrder, sort: SortType) => {
  if (orderBy === "DATE_CREATED" && sort === "ASC") {
    return "DATE_CREATED_OLD"
  }

  return orderBy
}

export function AlbumWorkList(props: Props) {
  const t = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigation = useNavigation()
  const viewMode = toViewMode(searchParams.get("view"))
  const isSeriesOrder = props.orderBy === "MANUAL"
  const firstNumber = ALBUM_WORKS_PER_PAGE * props.page + 1
  const lastNumber = Math.min(
    ALBUM_WORKS_PER_PAGE * (props.page + 1),
    props.maxCount,
  )

  const orderLabels: Record<string, string> = {
    MANUAL: t("シリーズの順", "Series order"),
    DATE_CREATED: t("新しい順", "Newest"),
    DATE_CREATED_OLD: t("古い順", "Oldest"),
    LIKES_COUNT: t("いいね順", "Most liked"),
  }

  const updateSearchParams = (updates: {
    view?: ViewMode
    orderBy?: AlbumWorkOrder
    sort?: SortType | null
  }) => {
    const params = new URLSearchParams(searchParams)

    if (updates.view !== undefined) {
      if (updates.view === "square") {
        params.delete("view")
      } else {
        params.set("view", updates.view)
      }
    }

    if (updates.orderBy !== undefined) {
      if (updates.orderBy === "MANUAL") {
        params.delete("orderBy")
      } else {
        params.set("orderBy", updates.orderBy)
      }
      params.delete("page")
    }

    if (updates.sort !== undefined) {
      if (updates.sort === null || updates.sort === "DESC") {
        params.delete("sort")
      } else {
        params.set("sort", updates.sort)
      }
      params.delete("page")
    }

    // 一覧を見ている位置から動かさない
    setSearchParams(params, { preventScrollReset: true })
  }

  const toPageHref = (page: number) => {
    const params = new URLSearchParams(searchParams)

    if (page === 0) {
      params.delete("page")
    } else {
      params.set("page", String(page + 1))
    }

    const search = params.toString()

    // ページを送ったら、表紙ではなく一覧の先頭に戻る
    return `${search ? `?${search}` : "?"}#works`
  }

  return (
    <section id="works" className="flex scroll-mt-20 flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="flex items-baseline gap-2">
          <h2 className="font-bold text-lg">{t("作品", "Works")}</h2>
          {props.maxCount > ALBUM_WORKS_PER_PAGE && props.works.length > 0 && (
            <span className="text-muted-foreground text-xs tabular-nums">
              {t(
                `${props.maxCount}件中 ${firstNumber}〜${lastNumber}件`,
                `${firstNumber}–${lastNumber} of ${props.maxCount}`,
              )}
            </span>
          )}
        </div>
        {props.maxCount > 1 && (
          <div className="flex items-center gap-2">
            <Select
              value={toSelectOrderValue(props.orderBy, props.sort)}
              onValueChange={(value) => {
                if (value === "DATE_CREATED_OLD") {
                  updateSearchParams({ orderBy: "DATE_CREATED", sort: "ASC" })
                  return
                }

                if (value === "MANUAL" || value === "LIKES_COUNT") {
                  updateSearchParams({ orderBy: value, sort: null })
                  return
                }

                if (value === "DATE_CREATED") {
                  updateSearchParams({ orderBy: value, sort: "DESC" })
                }
              }}
            >
              <SelectTrigger
                className="h-9 w-36"
                aria-label={t("並び順", "Sort order")}
              >
                <SelectValue placeholder={t("並び順", "Sort order")} />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(orderLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={(value) => {
                if (value === "square" || value === "natural") {
                  updateSearchParams({ view: value })
                }
              }}
              className="gap-0.5 rounded-md border p-0.5"
            >
              <ToggleGroupItem
                value="square"
                aria-label={t("正方形で表示", "Square view")}
                title={t("正方形で表示", "Square view")}
                className="size-8 min-w-8 p-0 data-[state=on]:bg-muted"
              >
                <SquareViewIcon className="size-4" />
              </ToggleGroupItem>
              <ToggleGroupItem
                value="natural"
                aria-label={t("元の比率で表示", "Original ratio view")}
                title={t("元の比率で表示", "Original ratio view")}
                className="size-8 min-w-8 p-0 data-[state=on]:bg-muted"
              >
                <NaturalViewIcon className="size-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        )}
      </div>

      <div
        aria-busy={navigation.state === "loading"}
        className={cn(
          "transition-opacity duration-200",
          navigation.state === "loading" && "opacity-60",
        )}
      >
        {props.works.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed px-4 py-12 text-center text-muted-foreground text-sm">
            {props.maxCount === 0 ? (
              t("まだ作品がありません", "No works yet")
            ) : (
              <>
                {t("このページに作品はありません", "No works on this page")}
                <Link to={toPageHref(0)} className="text-foreground underline">
                  {t("最初のページへ", "Go to the first page")}
                </Link>
              </>
            )}
          </div>
        ) : viewMode === "square" ? (
          <SquareAlbumWorkGrid
            works={props.works}
            firstNumber={isSeriesOrder ? firstNumber : null}
            isAdultSeries={props.isAdultSeries}
          />
        ) : (
          <MasonryWorkGrid
            works={
              props.isAdultSeries
                ? props.works
                : props.works.filter((work) => !isAdultWork(work))
            }
            baseUrl="posts"
          />
        )}
      </div>

      <LinkPagination
        className="mt-2"
        currentPage={props.page}
        totalCount={props.maxCount}
        perPage={ALBUM_WORKS_PER_PAGE}
        maxPage={99}
        toHref={toPageHref}
        labels={{
          prev: t("前へ", "Previous"),
          next: t("次へ", "Next"),
          nav: t("ページ送り", "Pagination"),
        }}
      />
    </section>
  )
}

function SquareAlbumWorkGrid(props: {
  works: FragmentOf<typeof PhotoAlbumWorkFragment>[]
  /** シリーズの順のときの最初の番号（ほかの順では番号を出さない） */
  firstNumber: number | null
  isAdultSeries: boolean
}) {
  const t = useTranslation()

  return (
    <ol className="grid grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
      {props.works.map((work, index) => (
        <li key={work.id} className="group min-w-0">
          <div className="relative overflow-hidden rounded-xl bg-muted shadow-sm transition-shadow duration-200 group-hover:shadow-md">
            {!props.isAdultSeries && isAdultWork(work) ? (
              // 全年齢のシリーズに混ざった R18 の作品は、画像を読まずに案内だけ出す
              <Link
                to={`/posts/${work.id}`}
                className="flex aspect-square flex-col items-center justify-center gap-1 text-muted-foreground text-xs"
              >
                <span className="rounded-full bg-rose-600 px-2 py-0.5 font-bold text-[11px] text-white">
                  {work.rating}
                </span>
                {t("R18 の作品です", "Adult work")}
              </Link>
            ) : (
              <>
                <CroppedWorkSquare
                  title={work.title}
                  workId={work.id}
                  subWorksCount={work.subWorksCount}
                  commentsCount={work.commentsCount}
                  imageUrl={work.smallThumbnailImageURL}
                  thumbnailImagePosition={work.thumbnailImagePosition ?? 0}
                  size="auto"
                  imageWidth={work.smallThumbnailImageWidth}
                  imageHeight={work.smallThumbnailImageHeight}
                  isLowPriority={true}
                  displayWidth="(min-width: 1280px) 240px, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                  isPromptPublic={
                    work.promptAccessType === "PUBLIC" || work.isGeneration
                  }
                  hasVideoUrl={Boolean(work.url)}
                  isGeneration={work.isGeneration}
                />
                <div className="absolute right-2 bottom-2 z-10">
                  <LikeButton
                    size={44}
                    targetWorkId={work.id}
                    targetWorkOwnerUserId={work.user?.id ?? ""}
                    defaultLiked={work.isLiked}
                    defaultLikedCount={0}
                    likedCount={work.likesCount}
                    isBackgroundNone={true}
                    strokeWidth={2}
                  />
                </div>
              </>
            )}
          </div>
          <Link
            to={`/posts/${work.id}`}
            className="mt-2 flex min-w-0 items-baseline gap-1.5 text-sm hover:underline"
          >
            {props.firstNumber !== null && (
              <span className="shrink-0 font-bold text-muted-foreground tabular-nums">
                {props.firstNumber + index}
              </span>
            )}
            <span className="truncate">{work.title}</span>
          </Link>
        </li>
      ))}
    </ol>
  )
}

function SquareViewIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <rect
        x="4.5"
        y="4.5"
        width="15"
        height="15"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  )
}

function NaturalViewIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <rect
        x="3.5"
        y="6.5"
        width="17"
        height="11"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M8 14.5L10.7 11.8C11.1 11.4 11.8 11.4 12.2 11.8L13.5 13.1C13.9 13.5 14.6 13.5 15 13.1L16 12.1"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  )
}

export const AlbumWorkListItemFragment = graphql(
  `fragment AlbumWorkListItem on WorkNode @_unmask {
    ...PhotoAlbumWork
  }`,
  [PhotoAlbumWorkFragment],
)
