import {
  FoldersListTable,
  FolderTableItemFragment,
} from "~/routes/($lang).my._index/components/folders-list-table"
import { FoldersSpList } from "~/routes/($lang).my._index/components/folders-sp-list"
import { type FragmentOf, graphql } from "gql.tada"
import { MobileFolderListItemFragment } from "~/routes/($lang).my._index/components/folders-sp-list-item"
import type { SortType } from "~/types/sort-type"
import type { IntrospectionEnum } from "~/lib/introspection-enum"

type Props = {
  folders: FragmentOf<typeof FolderListItemFragment>[]
  sort: SortType
  orderBy: IntrospectionEnum<"FolderOrderBy">
  onClickTitleSortButton: () => void
  onClickDateSortButton: () => void
}

/**
 * シリーズ一覧
 */
export function FoldersList (props: Props) {
  const truncateTitle = (title: string, maxLength: number) => {
    return title.length > maxLength ? `${title.slice(0, maxLength)}...` : title
  }

  const displayFolders = props.folders.map((folder) => {
    return {
      ...folder,
      title: truncateTitle(folder.title, 32),
    }
  })

  return (
    <>
      <div className="hidden md:block">
        <FoldersListTable
          folders={displayFolders}
          sort={props.sort}
          orderBy={props.orderBy}
          onClickTitleSortButton={props.onClickTitleSortButton}
          onClickDateSortButton={props.onClickDateSortButton}
        />
      </div>
      <div className="block md:hidden">
        <FoldersSpList folders={props.folders} />
      </div>
    </>
  )
}

export const FolderListItemFragment = graphql(
  `fragment FolderListItem on FolderNode @_unmask {
    ...FolderTableItem
    ...MobileFolderListItem
  }`,
  [FolderTableItemFragment, MobileFolderListItemFragment],
)
