import { AuthContext } from "~/contexts/auth-context"
import { useContext } from "react"
import { ResponsivePagination } from "~/components/responsive-pagination"
import { useSuspenseQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import type { SortType } from "~/types/sort-type"
import {
  FolderListItemFragment,
  FoldersList,
} from "~/routes/($lang).my._index/components/folders-list"

type Props = {
  page: number
  foldersMaxCount: number
  sort: SortType
  orderBy: IntrospectionEnum<"FolderOrderBy">
  setFolderPage: (page: number) => void
  onClickFolderTitleSortButton: () => void
  onClickFolderDateSortButton: () => void
}

/**
 * フォルダ一覧コンテナ
 */
export function FoldersListContainer(props: Props) {
  const authContext = useContext(AuthContext)

  if (
    authContext.isLoading ||
    authContext.isNotLoggedIn ||
    authContext.userId === undefined ||
    !authContext.userId
  ) {
    return null
  }

  const { data: FoldersResp, refetch } = useSuspenseQuery(viewerFoldersQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: {
      offset: 16 * props.page,
      limit: 16,
      where: {
        orderBy: props.orderBy,
        sort: props.sort,
      },
    },
  })

  const Folders = FoldersResp?.viewer?.folders ?? []

  const _refetchFolders = () => {
    refetch()
  }

  return (
    <>
      <FoldersList
        folders={Folders}
        sort={props.sort}
        orderBy={props.orderBy}
        onClickTitleSortButton={props.onClickFolderTitleSortButton}
        onClickDateSortButton={props.onClickFolderDateSortButton}
      />
      <div className="h-8" />
      <div className="-translate-x-1/2 fixed bottom-0 left-1/2 z-10 w-full border-border/40 bg-background/95 p-2 backdrop-blur-sm supports-backdrop-filter:bg-background/80">
        <ResponsivePagination
          perPage={16}
          maxCount={props.foldersMaxCount}
          currentPage={props.page}
          onPageChange={(page: number) => {
            props.setFolderPage(page)
          }}
        />
      </div>
    </>
  )
}

const viewerFoldersQuery = graphql(
  `query ViewerFolders($offset: Int!, $limit: Int!, $where: ViewerFoldersWhereInput) {
    viewer {
      folders(offset: $offset, limit: $limit, where: $where) {
        ...FolderListItem
      }
    }
  }`,
  [FolderListItemFragment],
)
