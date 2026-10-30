import { useApolloClient } from "@apollo/client/index"
import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { useLoaderData, useNavigate, useSearchParams } from "@remix-run/react"
import { graphql } from "gql.tada"
import { Bookmark, Search, Users, X } from "lucide-react"
import { useContext, useEffect, useMemo, useState } from "react"
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

// いいね数が古いまま残らないよう短めにキャッシュする
export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.short,
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
  const apolloClient = useApolloClient()
  const authContext = useContext(AuthContext)
  const [searchText, setSearchText] = useState(data.search ?? "")
  const [viewerAlbums, setViewerAlbums] = useState(data.albums)
  const [viewerAlbumsCount, setViewerAlbumsCount] = useState(data.albumsCount)
  const [isViewerQueryLoading, setIsViewerQueryLoading] = useState(false)

  const needsViewerFilters = data.followingOnly || data.favoritesOnly

  useEffect(() => {
    setSearchText(data.search ?? "")
  }, [data.search])

  const clientWhere = useMemo(
    () => ({
      ...(data.rating && { ratings: [data.rating] }),
      ...(data.search && { search: data.search }),
      orderBy: data.orderBy,
      sort: "DESC",
      needsThumbnailImage: true,
      needInspected: false,
      ...(data.followingOnly && { isFollowing: true }),
      ...(data.favoritesOnly && { isWatched: true }),
    }),
    [
      data.favoritesOnly,
      data.followingOnly,
      data.orderBy,
      data.rating,
      data.search,
    ],
  )

  useEffect(() => {
    if (authContext.isLoading) {
      return
    }

    if (!authContext.isLoggedIn) {
      setViewerAlbums(data.albums)
      setViewerAlbumsCount(data.albumsCount)
      setIsViewerQueryLoading(false)
      return
    }

    let isCancelled = false

    const fetchViewerAlbums = async () => {
      // 条件を変えたら、前の条件の結果を残さずにまずサーバーの結果を出す
      setViewerAlbums(data.albums)
      setViewerAlbumsCount(data.albumsCount)
      setIsViewerQueryLoading(true)

      try {
        const albumsResp = await apolloClient.query({
          query: albumsQuery,
          variables: {
            offset: data.page * PER_PAGE,
            limit: PER_PAGE,
            where: clientWhere as never,
          },
          fetchPolicy: "network-only",
        })

        const countResp = needsViewerFilters
          ? await apolloClient.query({
              query: albumsCountQuery,
              variables: {
                where: clientWhere as never,
              },
              fetchPolicy: "network-only",
            })
          : null

        if (isCancelled) {
          return
        }

        setViewerAlbums(albumsResp.data.albums ?? [])
        setViewerAlbumsCount(
          countResp?.data.albumsCount ?? data.albumsCount ?? 0,
        )
      } catch (error) {
        console.error("Error fetching viewer filtered albums", error)

        if (isCancelled) {
          return
        }

        setViewerAlbums(data.albums)
        setViewerAlbumsCount(data.albumsCount)
      } finally {
        if (!isCancelled) {
          setIsViewerQueryLoading(false)
        }
      }
    }

    fetchViewerAlbums()

    return () => {
      isCancelled = true
    }
  }, [
    apolloClient,
    authContext.isLoading,
    authContext.isLoggedIn,
    clientWhere,
    data.albums,
    data.albumsCount,
    data.page,
    needsViewerFilters,
  ])

  const albums =
    needsViewerFilters && !authContext.isLoggedIn && authContext.isNotLoading
      ? []
      : authContext.isLoggedIn
        ? viewerAlbums
        : data.albums

  const albumsCount =
    needsViewerFilters && !authContext.isLoggedIn && authContext.isNotLoading
      ? 0
      : authContext.isLoggedIn
        ? viewerAlbumsCount
        : data.albumsCount

  const isClientRefreshing = isViewerQueryLoading

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
        className="h-9 gap-2 rounded-full px-4"
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
          className="h-9 gap-2 rounded-full px-4"
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

  const ratingOptions = [
    { value: "ALL", label: t("すべて", "All") },
    { value: "G", label: toRatingText("G") },
    { value: "R15", label: toRatingText("R15") },
    { value: "R18", label: toRatingText("R18") },
    { value: "R18G", label: toRatingText("R18G") },
  ]

  const hasFilters =
    data.search !== null ||
    data.rating !== null ||
    data.followingOnly ||
    data.favoritesOnly

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5">
      <header className="space-y-4 rounded-2xl border bg-linear-to-br from-sky-50 via-background to-violet-50 p-4 md:p-6 dark:from-sky-950/30 dark:to-violet-950/30">
        <div className="space-y-1">
          <h1 className="font-bold text-2xl md:text-3xl">
            {t("シリーズ", "Series")}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t(
              "作品をまとめたシリーズを探せます。気に入ったシリーズはブックマークで「お気に入り」に入ります。",
              "Browse collections of works. Bookmark a series to add it to your favorites.",
            )}
          </p>
        </div>
        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault()
            submitSearch()
          }}
        >
          <div className="relative flex-1">
            <Search
              className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 size-4 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={searchText}
              onChange={(event) => {
                setSearchText(event.target.value)
              }}
              aria-label={t("シリーズを検索", "Search series")}
              placeholder={t(
                "シリーズ名・説明・タグで検索（空白で複数語）",
                "Search by name, description, or tag",
              )}
              className="h-11 rounded-xl bg-background pr-10 pl-9 text-base md:text-sm"
            />
            {searchText.length > 0 && (
              <button
                type="button"
                className="-translate-y-1/2 absolute top-1/2 right-2 rounded-full p-1.5 text-muted-foreground hover:bg-muted"
                aria-label={t("検索語を消す", "Clear search")}
                onClick={() => {
                  setSearchText("")
                  if (data.search) {
                    updateSearchParams({ search: null, page: null })
                  }
                }}
              >
                <X className="size-4" />
              </button>
            )}
          </div>
          <Button type="submit" className="h-11 rounded-xl px-5">
            {t("検索", "Search")}
          </Button>
        </form>
        <div className="flex flex-wrap items-center gap-2">
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
            icon: <Bookmark className="size-4" />,
            paramKey: "favorites",
          })}
          <div className="ml-auto flex flex-wrap gap-2">
            <Select
              value={data.orderBy}
              onValueChange={(value) => {
                updateSearchParams({
                  orderBy: value,
                  page: null,
                })
              }}
            >
              <SelectTrigger
                className="h-9 w-36 rounded-full bg-background"
                aria-label={t("並び順", "Sort order")}
              >
                <SelectValue placeholder={t("並び順", "Sort order")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DATE_UPDATED">
                  {t("更新が新しい順", "Recently updated")}
                </SelectItem>
                <SelectItem value="DATE_CREATED">
                  {t("作成が新しい順", "Recently created")}
                </SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={data.rating ?? "ALL"}
              onValueChange={(value) => {
                updateSearchParams({
                  rating: value === "ALL" ? null : value,
                  page: null,
                })
              }}
            >
              <SelectTrigger
                className="h-9 w-44 rounded-full bg-background"
                aria-label={t("年齢制限", "Rating")}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ratingOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.value === "ALL"
                      ? t("年齢制限：すべて", "Rating: all")
                      : option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm" aria-live="polite">
          {data.search ? (
            <>
              <span className="font-bold">「{data.search}」</span>
              {t("の検索結果 ", " results: ")}
            </>
          ) : null}
          <span className="font-bold">{albumsCount.toLocaleString()}</span>
          {t("件", " series")}
          {isClientRefreshing && (
            <span className="ml-2 text-muted-foreground">
              {t("読み込み中…", "Loading…")}
            </span>
          )}
        </p>
        {hasFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="rounded-full"
            onClick={() => {
              setSearchText("")
              navigate("?")
            }}
          >
            <X className="size-4" />
            {t("条件をクリア", "Clear filters")}
          </Button>
        )}
      </div>
      {needsViewerFilters &&
        !authContext.isLoggedIn &&
        authContext.isNotLoading && (
          <div className="rounded-2xl border border-dashed p-8 text-center text-muted-foreground text-sm">
            {t(
              "フォロー中・お気に入りのシリーズを見るにはログインが必要です。",
              "Log in to view followed or favorited series.",
            )}
          </div>
        )}
      <div
        className={
          isClientRefreshing
            ? "pointer-events-none opacity-60 transition"
            : "transition"
        }
      >
        {albums.length > 0 ? (
          <PublicAlbumList albums={albums} />
        ) : (
          !isClientRefreshing &&
          !(needsViewerFilters && !authContext.isLoggedIn) && (
            <div className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground text-sm">
              {data.search
                ? t(
                    "「{{q}}」に一致するシリーズは見つかりませんでした。別の言葉でお試しください。",
                    "No series matched “{{q}}”. Try another word.",
                  ).replace("{{q}}", data.search)
                : t(
                    "条件に一致するシリーズはありません。",
                    "No series matched your filters.",
                  )}
            </div>
          )
        )}
      </div>
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
