import { useQuery } from "@apollo/client/index"
import { useNavigate } from "@remix-run/react"
import { graphql, type FragmentOf } from "gql.tada"
import { useContext } from "react"
import { ResponsivePagination } from "~/components/responsive-pagination"
import {
  PhotoAlbumWorkFragment,
  ResponsivePhotoWorksAlbum,
} from "~/components/responsive-photo-works-album"
import { AuthContext } from "~/contexts/auth-context"

type Props = {
  works: FragmentOf<typeof EventSensitiveWorkListItemFragment>[]
  maxCount: number
  page: number
  slug: string
}

/**
 * イベント作品一覧
 */
export function EventSensitiveWorkList(props: Props) {
  const navigate = useNavigate()

  const authContext = useContext(AuthContext)

  const { data: resp } = useQuery(query, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: {
      offset: props.page * 64,
      limit: 64,
      where: {
        ratings: ["R18", "R18G"],
      },
      slug: props.slug,
    },
  })

  const workDisplayed = resp?.appEvent?.works ?? props.works

  return (
    <>
      <ResponsivePhotoWorksAlbum works={workDisplayed} />
      <ResponsivePagination
        maxCount={Number(props.maxCount)}
        perPage={64}
        currentPage={props.page}
        onPageChange={(page: number) => {
          navigate(`/events/${props.slug}?page=${page}`)
        }}
      />
    </>
  )
}

export const EventSensitiveWorkListItemFragment = graphql(
  `fragment EventSensitiveWorkListItem on WorkNode @_unmask {
    ...PhotoAlbumWork
  }`,
  [PhotoAlbumWorkFragment],
)

const query = graphql(
  `query AppEvent($slug: String!, $offset: Int!, $limit: Int!, $where: WorksWhereInput!) {
      appEvent(slug: $slug) {
        works(offset: $offset, limit: $limit, where: $where) {
          ...EventSensitiveWorkListItem
        }
      }
    }`,
  [EventSensitiveWorkListItemFragment],
)
