import { type FragmentOf, graphql } from "gql.tada"
import {
  BookmarkWorksListTable,
  BookmarkWorksTableItemFragment,
} from "~/routes/($lang).my._index/components/bookmark-works-list-table"
import {
  BookmarkWorksSpList,
  BookmarkWorksSpListItemFragment,
} from "~/routes/($lang).my._index/components/bookmark-works-sp-list"

type Props = {
  works: FragmentOf<typeof BookmarkWorksListItemFragment>[]
}

/**
 * 推薦作品一覧
 */
export function BookmarkWorksList(props: Props) {
  return (
    <>
      <div className="hidden md:block">
        <BookmarkWorksListTable works={props.works} />
      </div>
      <div className="block md:hidden">
        <BookmarkWorksSpList works={props.works} />
      </div>
    </>
  )
}

export const BookmarkWorksListItemFragment = graphql(
  `fragment BookmarkWorksListItem on WorkNode @_unmask {
    ...BookmarkWorksTableItem
    ...BookmarkWorksSpListItem
  }`,
  [BookmarkWorksTableItemFragment, BookmarkWorksSpListItemFragment],
)
