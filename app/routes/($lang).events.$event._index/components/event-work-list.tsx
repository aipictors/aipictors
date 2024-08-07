import { useQuery } from "@apollo/client/index"
import { useNavigate } from "@remix-run/react"
import { graphql, type FragmentOf } from "gql.tada"
import { useContext } from "react"
import { ResponsivePagination } from "~/components/responsive-pagination"
import { ResponsivePhotoWorksAlbum } from "~/components/responsive-photo-works-album"
import { AuthContext } from "~/contexts/auth-context"
import { partialWorkFieldsFragment } from "~/graphql/fragments/partial-work-fields"

type Props = {
  works: FragmentOf<typeof partialWorkFieldsFragment>[]
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

  const { data: resp } = useQuery(appEventQuery, {
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

  const workDisplayed = resp?.appEvent?.works ?? props.works

  return (
    <>
      <ResponsivePhotoWorksAlbum works={workDisplayed} isHideProfile={true} />
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

const appEventQuery = graphql(
  `query AppEvent($slug: String!, $offset: Int!, $limit: Int!, $where: WorksWhereInput!) {
      appEvent(slug: $slug) {
        works(offset: $offset, limit: $limit, where: $where) {
          ...PartialWorkFields
        }
      }
    }`,
  [partialWorkFieldsFragment],
)
