import { ResponsivePagination } from "@/_components/responsive-pagination"
import { ResponsivePhotoWorksAlbum } from "@/_components/responsive-photo-works-album"
import { partialWorkFieldsFragment } from "@/_graphql/fragments/partial-work-fields"
import { useSuspenseQuery } from "@apollo/client/index"
import { type FragmentOf, graphql } from "gql.tada"
import { useState } from "react"

type Props = {
  albumId: string
  albumWorks: FragmentOf<typeof partialWorkFieldsFragment>[]
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

  const { data } = useSuspenseQuery(albumWorksQuery, {
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

const albumWorksQuery = graphql(
  `query AlbumWorks($albumId: ID!, $offset: Int!, $limit: Int!) {
    album(id: $albumId) {
      id
      works(offset: $offset, limit: $limit) {
        ...PartialWorkFields
      }
    }
  }`,
  [partialWorkFieldsFragment],
)
