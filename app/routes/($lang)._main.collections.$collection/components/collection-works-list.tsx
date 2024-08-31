import { graphql, type FragmentOf } from "gql.tada"
import {
  PhotoAlbumWorkFragment,
  ResponsivePhotoWorksAlbum,
} from "~/components/responsive-photo-works-album"
import { ResponsivePagination } from "~/components/responsive-pagination"

type Props = {
  works: FragmentOf<typeof CollectionWorkListItemFragment>[]
  page: number
  setPage: (page: number) => void
  maxCount: number
}

export function CollectionWorkList(props: Props) {
  return (
    <div className="space-y-2">
      <ResponsivePhotoWorksAlbum
        works={props.works}
        targetRowHeight={240}
        size="large"
        isHideProfile={true}
      />
      <div className="h-8" />
      <div className="-translate-x-1/2 fixed bottom-0 left-1/2 z-10 w-full border-border/40 bg-background/95 p-2 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <ResponsivePagination
          perPage={16}
          maxCount={props.maxCount}
          currentPage={props.page}
          onPageChange={(page: number) => {
            props.setPage(page)
          }}
        />
      </div>
    </div>
  )
}

export const CollectionWorkListItemFragment = graphql(
  `fragment CollectionWorkListItem on WorkNode @_unmask {
    ...PhotoAlbumWork
  }`,
  [PhotoAlbumWorkFragment],
)
