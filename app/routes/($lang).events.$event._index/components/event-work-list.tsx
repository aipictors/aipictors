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
  works: FragmentOf<typeof EventWorkListItemFragment>[]
  isSensitive: boolean
  maxCount: number
  page: number
  slug: string
}

/**
 * イベント作品一覧
 */
export function EventWorkList(props: Props) {
  const navigate = useNavigate()

  const authContext = useContext(AuthContext)

  const { data: resp } = useQuery(query, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: {
      offset: props.page * 64,
      limit: 64,
      where: {
        ratings: ["G", "R15"],
      },
      slug: props.slug,
    },
  })

  const works = resp?.appEvent?.works ?? props.works

  return (
    <>
      <ResponsivePhotoWorksAlbum works={works} isShowProfile={true} />
      <div className="h-8" />
      <div className="-translate-x-1/2 fixed bottom-0 left-1/2 z-10 w-full border-border/40 bg-background/95 p-2 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <ResponsivePagination
          maxCount={Number(props.maxCount)}
          perPage={64}
          currentPage={props.page}
          onPageChange={(page: number) => {
            navigate(`/events/${props.slug}?page=${page}`)
          }}
        />
      </div>
    </>
  )
}

export const EventWorkListItemFragment = graphql(
  `fragment EventWorkListItem on WorkNode @_unmask {
    ...PhotoAlbumWork
  }`,
  [PhotoAlbumWorkFragment],
)

const query = graphql(
  `query AppEvent($slug: String!, $offset: Int!, $limit: Int!, $where: WorksWhereInput!) {
      appEvent(slug: $slug) {
        works(offset: $offset, limit: $limit, where: $where) {
          ...EventWorkListItem
        }
      }
    }`,
  [EventWorkListItemFragment],
)
