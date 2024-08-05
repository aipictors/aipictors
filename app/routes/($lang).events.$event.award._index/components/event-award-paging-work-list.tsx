import { useQuery } from "@apollo/client/index"
import { useNavigate } from "@remix-run/react"
import { graphql, type FragmentOf } from "gql.tada"
import { useContext } from "react"
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
export function EventAwardPagingWorkList(props: Props) {
  const navigate = useNavigate()
  const authContext = useContext(AuthContext)

  const { data: resp } = useQuery(appEventQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: {
      offset: 0,
      limit: 200,
      isSensitive: props.isSensitive,
      slug: props.slug,
    },
  })

  const workDisplayed = resp?.appEvent?.awardWorks ?? props.works

  return (
    <>
      <ResponsivePhotoWorksAlbum works={workDisplayed} />
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

const appEventQuery = graphql(
  `query AppEvent($slug: String!, $offset: Int!, $limit: Int!, $isSensitive: Boolean!) {
      appEvent(slug: $slug) {
        awardWorks(offset: $offset, limit: $limit, isSensitive: $isSensitive) {
          ...PartialWorkFields
        }
      }
    }`,
  [partialWorkFieldsFragment],
)
