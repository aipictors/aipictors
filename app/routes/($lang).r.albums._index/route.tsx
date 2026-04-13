import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { useLoaderData, useNavigate, useSearchParams } from "@remix-run/react"
import { graphql } from "gql.tada"
import {
  PublicAlbumList,
  PublicAlbumListItemFragment,
} from "~/components/album/public-album-list"
import { ResponsivePagination } from "~/components/responsive-pagination"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { config } from "~/config"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { loaderClient } from "~/lib/loader-client"
import { createMeta } from "~/utils/create-meta"
import { toRatingText } from "~/utils/work/to-rating-text"

const PER_PAGE = 24

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
  if (value === "R18" || value === "R18G") {
    return value
  }

  return null
}

export async function loader(props: LoaderFunctionArgs) {
  const url = new URL(props.request.url)
  const page = toPage(url.searchParams.get("page"))
  const rating = toRating(url.searchParams.get("rating"))

  const where = {
    ...(rating ? { ratings: [rating] } : { isSensitive: true }),
    needsThumbnailImage: true,
    needInspected: false,
  }

  const [albumsResp, countResp] = await Promise.all([
    loaderClient.query({
      query: albumsQuery,
      variables: {
        offset: page * PER_PAGE,
        limit: PER_PAGE,
        where,
      },
    }),
    loaderClient.query({
      query: albumsCountQuery,
      variables: { where },
    }),
  ])

  return {
    albums: albumsResp.data.albums ?? [],
    albumsCount: countResp.data.albumsCount,
    page,
    rating,
  }
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneHour,
})

export const meta: MetaFunction = (props) => {
  return createMeta(
    {
      title: "R18シリーズ一覧",
      enTitle: "Sensitive Series List",
      description: "R18 / R18G のシリーズを閲覧できます",
      enDescription: "Browse sensitive public series.",
    },
    undefined,
    props.params.lang,
  )
}

export default function SensitiveAlbumsIndex() {
  const data = useLoaderData<typeof loader>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-muted-foreground text-sm">{data.albumsCount}件</p>
        <div className="w-48">
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
              <SelectItem value="ALL">すべて</SelectItem>
              <SelectItem value="R18">{toRatingText("R18")}</SelectItem>
              <SelectItem value="R18G">{toRatingText("R18G")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <PublicAlbumList albums={data.albums} />
      <ResponsivePagination
        perPage={PER_PAGE}
        maxCount={data.albumsCount}
        currentPage={data.page}
        onPageChange={(page) => {
          updateSearchParams({ page: String(page) })
        }}
      />
    </div>
  )
}

const albumsQuery = graphql(
  `query SensitivePublicAlbums($offset: Int!, $limit: Int!, $where: AlbumsWhereInput) {
    albums(offset: $offset, limit: $limit, where: $where) {
      ...PublicAlbumListItem
    }
  }`,
  [PublicAlbumListItemFragment],
)

const albumsCountQuery = graphql(
  `query SensitivePublicAlbumsCount($where: AlbumsWhereInput) {
    albumsCount(where: $where)
  }`,
)
