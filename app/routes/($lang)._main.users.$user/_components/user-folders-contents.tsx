import { ResponsiveFoldersList } from "@/_components/responsive-folders-list"
import { ResponsivePagination } from "@/_components/responsive-pagination"
import { AuthContext } from "@/_contexts/auth-context"
import { foldersQuery } from "@/_graphql/queries/folder/folders"
import { foldersCountQuery } from "@/_graphql/queries/folder/folders-count"
import type { IntrospectionEnum } from "@/_lib/introspection-enum"
import type { SortType } from "@/_types/sort-type"
import { useSuspenseQuery } from "@apollo/client/index"
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
      <ResponsiveFoldersList folders={folders} />
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
