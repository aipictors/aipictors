import { ResponsiveFoldersList } from "~/components/responsive-folders-list"
import { ResponsivePagination } from "~/components/responsive-pagination"
import { AuthContext } from "~/contexts/auth-context"
import { partialFolderFieldsFragment } from "~/graphql/fragments/partial-folder-fields"
import { partialUserFieldsFragment } from "~/graphql/fragments/partial-user-fields"
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
}

export const UserFoldersContents = (props: Props) => {
  const authContext = useContext(AuthContext)

  const { data: foldersResp, refetch } = useSuspenseQuery(foldersQuery, {
    skip: authContext.isLoading,
    variables: {
      offset: 16 * props.page,
      limit: 16,
      where: {
        userId: props.userId,
      },
    },
  })

  const folders = foldersResp?.folders ?? []

  const folderCountResp = useSuspenseQuery(foldersCountQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: {
      where: {
        userId: props.userId,
      },
    },
  })

  const foldersCount = folderCountResp.data?.foldersCount ?? 0

  return (
    <>
      <div className="flex flex-wrap gap-4">
        {folders.map((folder) => (
          <ResponsiveFoldersList
            key={folder.id}
            folder={folder}
            user={folder.user}
          />
        ))}
      </div>
      <div className="mt-1 mb-1">
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
      ...PartialFolderFields
      user {
        ...PartialUserFields
      }
    }
  }`,
  [partialFolderFieldsFragment, partialUserFieldsFragment],
)
