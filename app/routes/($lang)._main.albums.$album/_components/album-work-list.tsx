import { ResponsivePagination } from "@/_components/responsive-pagination"
import { ResponsivePhotoWorksAlbum } from "@/_components/responsive-photo-works-album"
import type { albumWorksQuery } from "@/_graphql/queries/album/album-works"
import type { ResultOf } from "gql.tada"
import { useState } from "react"

type Props = {
  albumWorks: NonNullable<ResultOf<typeof albumWorksQuery>["album"]>["works"]
  maxCount: number
}

export const AlbumWorkList = (props: Props) => {
  if (props.albumWorks === null || props.albumWorks.length === 0) {
    return (
      <div className="text-center">
        <p>作品がありません</p>
      </div>
    )
  }

  const [page, setPage] = useState(0)

  return (
    <>
      <ResponsivePhotoWorksAlbum
        direction="columns"
        works={props.albumWorks}
        targetRowHeight={320}
      />
      <div className="mt-1 mb-1">
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
