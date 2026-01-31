import { ResponsivePagination } from "~/components/responsive-pagination"
import {
  PhotoAlbumWorkFragment,
  ResponsivePhotoWorksAlbum,
} from "~/components/responsive-photo-works-album"
import { useSuspenseQuery } from "@apollo/client/index"
import { type FragmentOf, graphql } from "gql.tada"
import { useEffect } from "react"
import React from "react"
import { useSearchParams } from "@remix-run/react"

type Props = {
  albumId: string
  albumWorks: FragmentOf<typeof AlbumWorkListItemFragment>[]
  maxCount: number
  page: number
}

export function AlbumWorkList (props: Props) {
  const [searchParams, setSearchParams] = useSearchParams()

  // URLクエリパラメータから初期ページ番号を取得（1-indexed を 0-indexed に変換）
  const urlPage = Number(searchParams.get("page")) || 1
  const [page, setPage] = React.useState(urlPage - 1)

  // ページ変更時にクエリパラメータを更新
  useEffect(() => {
    const params = new URLSearchParams(searchParams)
    // 1-indexed で保存
    params.set("page", (page + 1).toString())
    setSearchParams(params)
  }, [page, searchParams, setSearchParams])

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
      <div className="-translate-x-1/2 fixed bottom-0 left-1/2 z-10 w-full border-border/40 bg-background/95 p-2 backdrop-blur-sm supports-backdrop-filter:bg-background/80">
        <ResponsivePagination
          perPage={32}
          maxCount={props.maxCount}
          currentPage={page}
          onPageChange={(newPage: number) => {
            setPage(newPage)
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
      worksCount
      works(offset: $offset, limit: $limit) {
        ...AlbumWorkListItem
      }
    }
  }`,
  [AlbumWorkListItemFragment],
)
