import { ResponsivePagination } from "~/components/responsive-pagination"
import {
  PhotoAlbumWorkFragment,
  ResponsivePhotoWorksAlbum,
} from "~/components/responsive-photo-works-album"
import { useSuspenseQuery } from "@apollo/client/index"
import { type FragmentOf, graphql } from "gql.tada"
import { useEffect } from "react"
import React from "react"
import { useSearchParams } from "react-router"

type Props = {
  albumId: string
  albumWorks: FragmentOf<typeof AlbumWorkListItemFragment>[]
  maxCount: number
  page: number
}

export function AlbumWorkList(props: Props) {
  if (props.albumWorks === null || props.albumWorks.length === 0) {
    return (
      <div className="text-center">
        <p>作品がありません</p>
      </div>
    )
  }

  const [searchParams, setSearchParams] = useSearchParams()

  const [page, setPage] = React.useState(Number(searchParams.get("page")) || 0)

  useEffect(() => {
    const params = new URLSearchParams()

    setSearchParams(params)
  }, [page])

  const { data } = useSuspenseQuery(query, {
    variables: {
      albumId: props.albumId,
      offset: 32 * page,
      limit: 32,
    },
    fetchPolicy: "cache-first",
  })

  const albumWorks = data.album?.works ?? props.albumWorks

  return (
    <>
      <ResponsivePhotoWorksAlbum
        direction="rows"
        works={albumWorks}
        targetRowHeight={80}
      />
      <div className="h-8" />
      <div className="-translate-x-1/2 fixed bottom-0 left-1/2 z-10 w-full border-border/40 bg-background/95 p-2 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <ResponsivePagination
          perPage={32}
          maxCount={props.maxCount}
          currentPage={page}
          onPageChange={(page: number) => {
            setPage(page)
          }}
        />
      </div>
    </>
  )
}

export const AlbumWorkListItemFragment = graphql(
  `fragment AlbumWorkListItem on WorkNode @_unmask {
    ...PhotoAlbumWork
  }`,
  [PhotoAlbumWorkFragment],
)

const query = graphql(
  `query AlbumWorks($albumId: ID!, $offset: Int!, $limit: Int!) {
    album(id: $albumId) {
      id
      works(offset: $offset, limit: $limit) {
        ...AlbumWorkListItem
      }
    }
  }`,
  [AlbumWorkListItemFragment],
)
