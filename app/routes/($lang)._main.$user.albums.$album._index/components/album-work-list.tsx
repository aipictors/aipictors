import { useSuspenseQuery } from "@apollo/client/index"
import { useSearchParams } from "@remix-run/react"
import { type FragmentOf, graphql } from "gql.tada"
import type React from "react"
import { CroppedWorkSquare } from "~/components/cropped-work-square"
import { LikeButton } from "~/components/like-button"
import { MasonryWorkGrid } from "~/components/masonry-work-grid"
import { ResponsivePagination } from "~/components/responsive-pagination"
import { PhotoAlbumWorkFragment } from "~/components/responsive-photo-works-album"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group"
import type { IntrospectionEnum } from "~/lib/introspection-enum"

type Props = {
  albumId: string
  albumWorks: FragmentOf<typeof AlbumWorkListItemFragment>[]
  maxCount: number
  page: number
}

type ViewMode = "square" | "natural"
type AlbumWorkOrder = IntrospectionEnum<"AlbumWorkOrderBy">

const toPage = (value: string | null) => {
  const parsedValue = Number.parseInt(value ?? "1", 10)

  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    return 0
  }

  return parsedValue - 1
}

const toViewMode = (value: string | null): ViewMode => {
  return value === "natural" ? "natural" : "square"
}

const toOrderBy = (value: string | null): AlbumWorkOrder => {
  if (value === "DATE_CREATED" || value === "LIKES_COUNT" || value === "MANUAL") {
    return value
  }

  return "MANUAL"
}

export function AlbumWorkList(props: Props) {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = toPage(searchParams.get("page"))
  const viewMode = toViewMode(searchParams.get("view"))
  const orderBy = toOrderBy(searchParams.get("orderBy"))

  const updateSearchParams = (updates: {
    page?: string | null
    view?: ViewMode | null
    orderBy?: AlbumWorkOrder | null
  }) => {
    const params = new URLSearchParams(searchParams)

    if (updates.page !== undefined) {
      if (updates.page === null) {
        params.delete("page")
      } else {
        params.set("page", updates.page)
      }
    }

    if (updates.view !== undefined) {
      if (updates.view === null || updates.view === "square") {
        params.delete("view")
      } else {
        params.set("view", updates.view)
      }
    }

    if (updates.orderBy !== undefined) {
      if (updates.orderBy === null || updates.orderBy === "MANUAL") {
        params.delete("orderBy")
      } else {
        params.set("orderBy", updates.orderBy)
      }
      params.delete("page")
    }

    setSearchParams(params)
  }

  const { data } = useSuspenseQuery(query, {
    variables: {
      albumId: props.albumId,
      offset: 32 * page,
      limit: 32,
      orderBy,
      sort: "DESC",
    },
    fetchPolicy: "cache-first",
  })

  const albumWorks = data.album?.works ?? props.albumWorks

  return (
    <>
      <div className="mb-4 flex items-center justify-end">
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Select
            value={orderBy}
            onValueChange={(value) => {
              if (value === "DATE_CREATED" || value === "LIKES_COUNT" || value === "MANUAL") {
                updateSearchParams({ orderBy: value })
              }
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="並び順" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MANUAL">手動順</SelectItem>
              <SelectItem value="DATE_CREATED">投稿日順</SelectItem>
              <SelectItem value="LIKES_COUNT">いいね順</SelectItem>
            </SelectContent>
          </Select>
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/90 p-1 pr-1.5 shadow-sm backdrop-blur-sm">
            <span className="pl-2 font-medium text-[11px] text-muted-foreground uppercase tracking-[0.18em]">
              View
            </span>
            <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={(value) => {
                if (value === "square" || value === "natural") {
                  updateSearchParams({ view: value })
                }
              }}
              className="gap-1"
            >
              <ToggleGroupItem
                value="square"
                aria-label="正方形表示"
                className="rounded-full px-3 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
              >
                <SquareViewIcon className="size-4" />
                <span className="hidden sm:inline">正方形</span>
              </ToggleGroupItem>
              <ToggleGroupItem
                value="natural"
                aria-label="比率維持表示"
                className="rounded-full px-3 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
              >
                <NaturalViewIcon className="size-4" />
                <span className="hidden sm:inline">比率維持</span>
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </div>

      {viewMode === "square" ? (
        <SquareAlbumWorkGrid works={albumWorks} />
      ) : (
        <MasonryWorkGrid works={albumWorks} baseUrl="posts" />
      )}

      <div className="h-8" />
      <div className="-translate-x-1/2 fixed bottom-0 left-1/2 z-10 w-full border-border/40 bg-background/95 p-2 backdrop-blur-sm supports-backdrop-filter:bg-background/80">
        <ResponsivePagination
          perPage={32}
          maxCount={props.maxCount}
          currentPage={page}
          onPageChange={(newPage: number) => {
            updateSearchParams({ page: String(newPage + 1) })
          }}
        />
      </div>
    </>
  )
}

function SquareAlbumWorkGrid(props: {
  works: FragmentOf<typeof PhotoAlbumWorkFragment>[]
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
      {props.works.map((work) => (
        <div
          key={work.id}
          className="group relative overflow-hidden rounded-xl bg-card shadow-sm transition-shadow duration-200 hover:shadow-md"
        >
          <CroppedWorkSquare
            workId={work.id}
            subWorksCount={work.subWorksCount}
            commentsCount={work.commentsCount}
            imageUrl={work.smallThumbnailImageURL}
            thumbnailImagePosition={work.thumbnailImagePosition ?? 0}
            size="auto"
            imageWidth={work.smallThumbnailImageWidth}
            imageHeight={work.smallThumbnailImageHeight}
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
        </div>
      ))}
    </div>
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

const query = graphql(
  `query AlbumWorksList($albumId: ID!, $offset: Int!, $limit: Int!, $orderBy: AlbumWorkOrderBy, $sort: Sort) {
    album(id: $albumId) {
      id
      worksCount
      works(offset: $offset, limit: $limit, orderBy: $orderBy, sort: $sort) {
        ...AlbumWorkListItem
      }
    }
  }`,
  [AlbumWorkListItemFragment],
)
