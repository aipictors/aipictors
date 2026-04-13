import { useQuery } from "@apollo/client/index"
import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { useLoaderData, useNavigate, useSearchParams } from "@remix-run/react"
import { graphql } from "gql.tada"
import { Heart, Search, Users, X } from "lucide-react"
import { useContext, useState } from "react"
import {
  PublicAlbumList,
  PublicAlbumListItemFragment,
} from "~/components/album/public-album-list"
import { LoginDialogButton } from "~/components/login-dialog-button"
import { ResponsivePagination } from "~/components/responsive-pagination"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { config } from "~/config"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { loaderClient } from "~/lib/loader-client"
import { createMeta } from "~/utils/create-meta"
import { toRatingText } from "~/utils/work/to-rating-text"

const PER_PAGE = 24

type AlbumOrderParam = "DATE_CREATED" | "DATE_UPDATED"

const toPage = (value: string | null) => {
  const page = Number.parseInt(value ?? "0", 10)

  if (!Number.isInteger(page) || page < 0) {
    return 0
  }

  return page
}

const toRating = (
  value: string | null,
): IntrospectionEnum<"AlbumRating"> | null => {
  if (value === "G" || value === "R15" || value === "R18" || value === "R18G") {
    return value
  }

  return null
}

const toOrderBy = (value: string | null): AlbumOrderParam => {
  if (value === "DATE_CREATED" || value === "DATE_UPDATED") {
    return value
  }

  return "DATE_UPDATED"
}

const toBooleanSearchFlag = (value: string | null) => {
  return value === "1"
}

const toSearch = (value: string | null) => {
  const normalizedValue = value?.trim() ?? ""
  return normalizedValue.length > 0 ? normalizedValue : null
}

export async function loader(props: LoaderFunctionArgs) {
  const url = new URL(props.request.url)
  const page = toPage(url.searchParams.get("page"))
  const rating = toRating(url.searchParams.get("rating"))
  const orderBy = toOrderBy(url.searchParams.get("orderBy"))
  const followingOnly = toBooleanSearchFlag(url.searchParams.get("following"))
  const favoritesOnly = toBooleanSearchFlag(url.searchParams.get("favorites"))
  const search = toSearch(url.searchParams.get("search"))

  const needsViewerFilters = followingOnly || favoritesOnly

  const where = {
    ...(rating && { ratings: [rating] }),
    ...(search && { search }),
    orderBy,
    sort: "DESC",
    needsThumbnailImage: true,
    needInspected: false,
  }

  if (needsViewerFilters) {
    return {
      albums: [],
      albumsCount: 0,
      page,
      rating,
      search,
      orderBy,
      followingOnly,
      favoritesOnly,
    }
  }

  const [albumsResp, countResp] = await Promise.all([
    loaderClient.query({
      query: albumsQuery,
      variables: {
        offset: page * PER_PAGE,
        limit: PER_PAGE,
        where: where as never,
      },
    }),
    loaderClient.query({
      query: albumsCountQuery,
      variables: { where: where as never },
    }),
  ])

  return {
    albums: albumsResp.data.albums ?? [],
    albumsCount: countResp.data.albumsCount,
    page,
    rating,
    search,
    orderBy,
    followingOnly,
    favoritesOnly,
  }
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneHour,
})

export const meta: MetaFunction = (props) => {
  return createMeta(
    {
      title: "シリーズ一覧",
      enTitle: "Series List",
      description: "すべてのユーザのシリーズを閲覧できます",
      enDescription: "Browse public series from all users.",
    },
    undefined,
    props.params.lang,
  )
}

export default function AlbumsIndex() {
  const t = useTranslation()
  const data = useLoaderData<typeof loader>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const authContext = useContext(AuthContext)
  const [searchText, setSearchText] = useState(data.search ?? "")

  const needsViewerFilters = data.followingOnly || data.favoritesOnly

  const clientWhere = {
    ...(data.rating && { ratings: [data.rating] }),
    ...(data.search && { search: data.search }),
    orderBy: data.orderBy,
    sort: "DESC",
    needsThumbnailImage: true,
    needInspected: false,
    ...(data.followingOnly && { isFollowing: true }),
    ...(data.favoritesOnly && { isWatched: true }),
  }

  const shouldSkipClientQuery =
    authContext.isLoading || (needsViewerFilters && !authContext.isLoggedIn)

  const { data: clientAlbumsData, loading: isAlbumsLoading } = useQuery(
    albumsQuery,
    {
      variables: {
        offset: data.page * PER_PAGE,
        limit: PER_PAGE,
        where: clientWhere as never,
      },
      fetchPolicy: "cache-and-network",
      skip: shouldSkipClientQuery,
    },
  )

  const { data: clientAlbumsCountData, loading: isAlbumsCountLoading } =
    useQuery(albumsCountQuery, {
      variables: {
        where: clientWhere as never,
      },
      fetchPolicy: "cache-and-network",
      skip: shouldSkipClientQuery,
    })

  const albums =
    needsViewerFilters && !authContext.isLoggedIn && authContext.isNotLoading
      ? []
      : (clientAlbumsData?.albums ?? data.albums)

  const albumsCount =
    needsViewerFilters && !authContext.isLoggedIn && authContext.isNotLoading
      ? 0
      : (clientAlbumsCountData?.albumsCount ?? data.albumsCount)

  const isClientRefreshing = isAlbumsLoading || isAlbumsCountLoading

  const updateSearchParams = (updates: Record<string, string | null>) => {
    const nextSearchParams = new URLSearchParams(searchParams)

    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") {
        nextSearchParams.delete(key)
      } else {
        nextSearchParams.set(key, value)
      }
    }

    navigate(`?${nextSearchParams.toString()}`)
  }

  const submitSearch = () => {
    updateSearchParams({
      search: searchText.trim() || null,
      page: null,
    })
  }

  const renderViewerFilterButton = (props: {
    active: boolean
    label: string
    description: string
    icon: React.ReactNode
    paramKey: "following" | "favorites"
  }) => {
    const triggerButton = (
      <Button
        type="button"
        variant={props.active ? "default" : "outline"}
        className="h-9 gap-2 px-3"
        onClick={
          authContext.isLoggedIn
            ? () => {
                updateSearchParams({
                  [props.paramKey]: props.active ? null : "1",
                  page: null,
                })
              }
            : undefined
        }
      >
        {props.icon}
        <span>{props.label}</span>
      </Button>
    )

    if (authContext.isLoggedIn) {
      return triggerButton
    }

    if (authContext.isLoading) {
      return (
        <Button
          type="button"
          variant="outline"
          className="h-9 gap-2 px-3"
          disabled
        >
          {props.icon}
          <span>{props.label}</span>
        </Button>
      )
    }

    return (
      <LoginDialogButton
        description={props.description}
        triggerChildren={triggerButton}
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-lg border bg-card p-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-muted-foreground text-sm">
            {albumsCount}件
            {isClientRefreshing ? ` / ${t("更新中", "Refreshing")}` : ""}
          </p>
          {needsViewerFilters &&
            !authContext.isLoggedIn &&
            authContext.isNotLoading && (
              <p className="text-muted-foreground text-xs">
                {t(
                  "フォロー中・お気に入りのシリーズ表示にはログインが必要です。",
                  "Login is required to view followed or favorited series.",
                )}
              </p>
            )}
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex w-full gap-2 md:w-auto md:min-w-[320px]">
            <Input
              value={searchText}
              onChange={(event) => {
                setSearchText(event.target.value)
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault()
                  submitSearch()
                }
              }}
              placeholder={t(
                "シリーズ名・タグで検索",
                "Search by series name or tag",
              )}
              className="h-9"
            />
            <Button
              type="button"
              variant="outline"
              className="h-9 px-3"
              onClick={submitSearch}
            >
              <Search className="size-4" />
            </Button>
            {data.search && (
              <Button
                type="button"
                variant="outline"
                className="h-9 px-3"
                onClick={() => {
                  setSearchText("")
                  updateSearchParams({ search: null, page: null })
                }}
              >
                <X className="size-4" />
              </Button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {renderViewerFilterButton({
              active: data.followingOnly,
              label: t("フォロー中", "Following"),
              description: t(
                "フォローしているユーザのシリーズを見るにはログインが必要です。",
                "You need to log in to view series from followed users.",
              ),
              icon: <Users className="size-4" />,
              paramKey: "following",
            })}
            {renderViewerFilterButton({
              active: data.favoritesOnly,
              label: t("お気に入り", "Favorites"),
              description: t(
                "お気に入りシリーズの一覧を見るにはログインが必要です。",
                "You need to log in to view your favorite series.",
              ),
              icon: <Heart className="size-4" />,
              paramKey: "favorites",
            })}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="w-full sm:w-44">
              <Select
                value={data.orderBy}
                onValueChange={(value) => {
                  updateSearchParams({
                    orderBy: value,
                    page: null,
                  })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("並び順", "Sort order")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DATE_UPDATED">
                    {t("更新日順", "Updated date")}
                  </SelectItem>
                  <SelectItem value="DATE_CREATED">
                    {t("作成日順", "Created date")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-48">
              <Select
                value={data.rating ?? "ALL"}
                onValueChange={(value) => {
                  updateSearchParams({
                    rating: value === "ALL" ? null : value,
                    page: null,
                  })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="すべての年齢制限" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">すべての年齢制限</SelectItem>
                  <SelectItem value="G">{toRatingText("G")}</SelectItem>
                  <SelectItem value="R15">{toRatingText("R15")}</SelectItem>
                  <SelectItem value="R18">{toRatingText("R18")}</SelectItem>
                  <SelectItem value="R18G">{toRatingText("R18G")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
      <PublicAlbumList albums={albums} />
      <ResponsivePagination
        perPage={PER_PAGE}
        maxCount={albumsCount}
        currentPage={data.page}
        onPageChange={(page) => {
          updateSearchParams({ page: String(page) })
        }}
      />
    </div>
  )
}

const albumsQuery = graphql(
  `query PublicAlbums($offset: Int!, $limit: Int!, $where: AlbumsWhereInput) {
    albums(offset: $offset, limit: $limit, where: $where) {
      ...PublicAlbumListItem
    }
  }`,
  [PublicAlbumListItemFragment],
)

const albumsCountQuery = graphql(
  `query PublicAlbumsCount($where: AlbumsWhereInput) {
    albumsCount(where: $where)
  }`,
)
