import { graphql, type FragmentOf } from "gql.tada"
import { ResponsivePagination } from "~/components/responsive-pagination"
import { ResponsivePhotoWorksAlbum } from "~/components/responsive-photo-works-album"
import { AiModelHeader } from "~/routes/($lang)._main.models.$model/components/ai-model-header"
import { useContext, useState } from "react"
import { useQuery } from "@apollo/client/index"
import { AuthContext } from "~/contexts/auth-context"
import { useNavigate } from "@remix-run/react"
import { WorkListItemFragment } from "~/routes/($lang)._main.posts._index/components/work-list"

type Props = {
  name: string
  thumbnailImageURL: string | null
  works: FragmentOf<typeof WorkListItemFragment>[]
  worksCount: number
  isSensitive: boolean
  isMoreRatings: boolean
  hasPrompt: boolean
  page: number
}

export function AiModelArticle(props: Props) {
  if (props.works === null || props.works.length === 0) {
    return (
      <div className="text-center">
        <p>作品がありません</p>
      </div>
    )
  }

  const authContext = useContext(AuthContext)

  const [page, setPage] = useState(props.page)

  const { data } = useQuery(aiModelWorksQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: {
      search: props.name,
      offset: 32 * page,
      limit: 32,
      where: {
        ratings: props.isSensitive
          ? props.isMoreRatings
            ? ["R18", "R18G"]
            : ["R18"]
          : props.isMoreRatings
            ? ["G", "R15"]
            : ["G"],
        isSensitive: props.isSensitive,
        hasPrompt: props.hasPrompt,
      },
    },
    fetchPolicy: "cache-first",
  })

  const works = data?.aiModel?.works ?? props.works

  const navigate = useNavigate()

  return (
    <div className="flex flex-col space-y-4">
      <AiModelHeader
        name={props.name}
        thumbnailImageURL={
          props.thumbnailImageURL
            ? props.thumbnailImageURL
            : works.length
              ? works[0].largeThumbnailImageURL
              : null
        }
        isSensitive={props.isSensitive}
        isMoreRatings={props.isMoreRatings}
        hasPrompt={props.hasPrompt}
        worksCount={props.worksCount}
      />
      <div className="space-y-4">
        <ResponsivePhotoWorksAlbum
          works={works}
          targetRowHeight={240}
          size="small"
          isHideProfile={true}
        />
        <ResponsivePagination
          perPage={16}
          maxCount={props.worksCount}
          currentPage={page}
          onPageChange={(page: number) => {
            setPage(page)
            navigate(`?page=${page}`)
          }}
        />
      </div>
    </div>
  )
}

const aiModelWorksQuery = graphql(
  `query AiModel($search: String!, $limit: Int!, $offset: Int!, $where: WorksWhereInput) {
    aiModel(where: {search: $search}) {
      works(limit: $limit, offset: $offset, where: $where) {
        ...WorkListItem
      }
    }
  }`,
  [WorkListItemFragment],
)
