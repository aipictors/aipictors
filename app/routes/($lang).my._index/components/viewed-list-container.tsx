import { AuthContext } from "~/contexts/auth-context"
import { useContext } from "react"
import {
  BookmarkWorksList,
  BookmarkWorksListItemFragment,
} from "~/routes/($lang).my._index/components/bookmark-works-list"
import { ResponsivePagination } from "~/components/responsive-pagination"
import { useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"

type Props = {
  page: number
  maxCount: number
  setPage: (page: number) => void
}

/**
 * 閲覧履歴一覧コンテナ
 */
export function ViewedListContainer(props: Props) {
  const authContext = useContext(AuthContext)

  if (
    authContext.isLoading ||
    authContext.isNotLoggedIn ||
    authContext.userId === undefined ||
    !authContext.userId
  ) {
    return null
  }
  const { data: workResp, refetch } = useQuery(viewedWorksQuery, {
    skip: authContext.isLoading,
    variables: {
      offset: 16 * props.page,
      limit: 16,
    },
  })

  const works = workResp?.viewer?.viewedWorks ?? []

  return (
    <>
      <BookmarkWorksList works={works} />
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
    </>
  )
}

const viewedWorksQuery = graphql(
  `query ViewerViewedWorks($offset: Int!, $limit: Int!) {
    viewer {
      viewedWorks(offset: $offset, limit: $limit) {
        ...BookmarkWorksListItem
      }
    }
  }`,
  [BookmarkWorksListItemFragment],
)
