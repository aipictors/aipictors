import { ResponsivePagination } from "~/components/responsive-pagination"
import {
  ResponsiveStickersList,
  StickerListItemFragment,
} from "~/components/responsive-stickers-list"
import { AuthContext } from "~/contexts/auth-context"
import { useSuspenseQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { useContext } from "react"

type Props = {
  page: number
  setPage(page: number): void
  userId: string
}

export function UserStickersContents (props: Props) {
  const authContext = useContext(AuthContext)

  const { data: stickersResp, refetch } = useSuspenseQuery(stickersQuery, {
    skip: authContext.isLoading,
    variables: {
      offset: 16 * props.page,
      limit: 16,
      where: {
        creatorUserId: props.userId,
      },
    },
  })

  const stickers = stickersResp?.stickers ?? []

  const stickersCountResp = useSuspenseQuery(stickersCountQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: {
      where: {
        creatorUserId: props.userId,
      },
    },
  })

  const stickersCount = stickersCountResp.data?.stickersCount ?? 0

  return (
    <>
      <ResponsiveStickersList stickers={stickers} />
      <div className="h-8" />
      <div className="-translate-x-1/2 fixed bottom-0 left-1/2 z-10 w-full border-border/40 bg-background/95 p-2 backdrop-blur-sm supports-backdrop-filter:bg-background/80">
        <ResponsivePagination
          perPage={16}
          maxCount={stickersCount}
          currentPage={props.page}
          onPageChange={(page: number) => {
            props.setPage(page)
          }}
        />
      </div>
    </>
  )
}

const stickersCountQuery = graphql(
  `query StickersCount($where: StickersWhereInput) {
    stickersCount(where: $where)
  }`,
)

const stickersQuery = graphql(
  `query Stickers($offset: Int!, $limit: Int!, $where: StickersWhereInput) {
    stickers(offset: $offset, limit: $limit, where: $where) {
      ...StickerListItem
    }
  }`,
  [StickerListItemFragment],
)
