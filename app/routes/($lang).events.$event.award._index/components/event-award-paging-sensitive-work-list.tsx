import { useQuery } from "@apollo/client/index"
import { graphql, type FragmentOf } from "gql.tada"
import { useContext } from "react"
import {
  PhotoAlbumWorkFragment,
  ResponsivePhotoWorksAlbum,
} from "~/components/responsive-photo-works-album"
import { AuthContext } from "~/contexts/auth-context"

type Props = {
  works: FragmentOf<typeof EventAwardWorkListItemFragment>[]
  maxCount: number
  page: number
  slug: string
  eventSource: "OFFICIAL" | "USER"
}

/**
 * イベント作品一覧
 */
export function EventAwardPagingSensitiveWorkList (props: Props) {
  const authContext = useContext(AuthContext)

  const { data } = useQuery<any>(query as any, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: {
      offset: 0,
      limit: 200,
      isSensitive: true,
      slug: props.slug,
    },
  })

  const resp = data as any

  const works = props.eventSource === "OFFICIAL"
    ? (resp?.appEvent?.awardWorks ?? props.works)
    : (resp?.userEvent?.awardWorks ?? props.works)

  return (
    <>
      <ResponsivePhotoWorksAlbum works={works} />
      {/* <ResponsivePagination
        maxCount={Number(props.maxCount)}
        perPage={64}
        currentPage={props.page}
        onPageChange={(page: number) => {
          navigate(`/events/${props.slug}/award?page=${page}`)
        }}
      /> */}
    </>
  )
}

export const EventAwardWorkListItemFragment = graphql(
  `fragment EventAwardWorkListItem on WorkNode @_unmask {
    ...PhotoAlbumWork
  }`,
  [PhotoAlbumWorkFragment],
)

const query = graphql(
  `query AppEvent($slug: String!, $offset: Int!, $limit: Int!, $isSensitive: Boolean!) {
      appEvent(slug: $slug) {
        awardWorks(offset: $offset, limit: $limit, isSensitive: $isSensitive) {
          ...EventAwardWorkListItem
        }
      }
      userEvent(slug: $slug) {
        awardWorks(offset: $offset, limit: $limit, isSensitive: $isSensitive) {
          ...EventAwardWorkListItem
        }
      }
    }`,
  [EventAwardWorkListItemFragment],
)
