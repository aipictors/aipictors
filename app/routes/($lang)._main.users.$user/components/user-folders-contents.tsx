import {
  FolderListItemFragment,
  ResponsiveFoldersList,
} from "~/components/responsive-folders-list"
import { ResponsivePagination } from "~/components/responsive-pagination"
import { AuthContext } from "~/contexts/auth-context"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import type { SortType } from "~/types/sort-type"
import { useSuspenseQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { useContext } from "react"

type Props = {
  page: number
  setPage(page: number): void
  userId: string
  orderBy: IntrospectionEnum<"AlbumOrderBy">
  rating: IntrospectionEnum<"AlbumRating"> | null
  sort: SortType
  isSensitive?: boolean
}

export function UserFoldersContents(props: Props) {
  const authContext = useContext(AuthContext)

  const { data: foldersResp, refetch } = useSuspenseQuery(foldersQuery, {
    skip: authContext.isLoading,
    variables: {
      offset: 16 * props.page,
      limit: 16,
      where: {
        userId: props.userId,
        isPrivate: false,
        isSensitive: props.isSensitive,
      },
    },
  })

  const folders = foldersResp?.folders ?? []

  const folderCountResp = useSuspenseQuery(foldersCountQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: {
      where: {
        userId: props.userId,
        isPrivate: false,
        isSensitive: props.isSensitive,
      },
    },
  })

  const foldersCount = folderCountResp.data?.foldersCount ?? 0

  return (
    <>
      <div className="flex flex-wrap gap-4">
        {folders.map((folder) => (
          <ResponsiveFoldersList key={folder.id} folder={folder} />
        ))}
      </div>
      <div className="h-8" />
      <div className="-translate-x-1/2 fixed bottom-0 left-1/2 z-10 w-full border-border/40 bg-background/95 p-2 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <ResponsivePagination
          perPage={16}
          maxCount={foldersCount}
          currentPage={props.page}
          onPageChange={(page: number) => {
            props.setPage(page)
          }}
        />
      </div>
    </>
  )
}

const foldersCountQuery = graphql(
  `query FoldersCount($where: FoldersWhereInput) {
    foldersCount(where: $where)
  }`,
)

const foldersQuery = graphql(
  `query Folders($offset: Int!, $limit: Int!, $where: FoldersWhereInput) {
    folders(offset: $offset, limit: $limit, where: $where) {
      id
      ...FolderListItem
    }
  }`,
  [FolderListItemFragment],
)
