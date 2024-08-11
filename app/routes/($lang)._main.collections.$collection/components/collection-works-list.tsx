import type { FragmentOf } from "gql.tada"
import type { partialWorkFieldsFragment } from "~/graphql/fragments/partial-work-fields"
import { ResponsivePhotoWorksAlbum } from "~/components/responsive-photo-works-album"
import { ResponsivePagination } from "~/components/responsive-pagination"

type Props = {
  works: FragmentOf<typeof partialWorkFieldsFragment>[]
  page: number
  setPage: (page: number) => void
  maxCount: number
}

export const CollectionWorkList = (props: Props) => {
  return (
    <div className="space-y-2">
      <ResponsivePhotoWorksAlbum
        works={props.works}
        targetRowHeight={240}
        size="large"
        isHideProfile={true}
      />
      <ResponsivePagination
        perPage={16}
        maxCount={props.maxCount}
        currentPage={props.page}
        onPageChange={(page: number) => {
          props.setPage(page)
        }}
      />
    </div>
  )
}
