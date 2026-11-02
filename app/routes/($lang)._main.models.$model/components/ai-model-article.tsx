import { graphql, readFragment, type FragmentOf } from "gql.tada"
import { ResponsivePagination } from "~/components/responsive-pagination"
import {
  type PhotoAlbumWorkFragment,
  ResponsivePhotoWorksAlbum,
} from "~/components/responsive-photo-works-album"
import { AiModelHeader } from "~/routes/($lang)._main.models.$model/components/ai-model-header"
import { useContext, useEffect, useState } from "react"
import { useQuery } from "@apollo/client/index"
import { AuthContext } from "~/contexts/auth-context"
import { useSearchParams } from "@remix-run/react"
import { WorkListItemFragment } from "~/routes/($lang)._main.posts._index/components/work-list"

type Props = {
  model: FragmentOf<typeof ModelItemFragment>
  isMoreRatings: boolean
  hasPrompt: boolean
  page: number
}

export function AiModelArticle(props: Props) {
  const model = readFragment(ModelItemFragment, props.model)

  const authContext = useContext(AuthContext)

  const [page, setPage] = useState(props.page)

  const [_searchParams, setSearchParams] = useSearchParams()

  const isEmpty =
    model.works === undefined || model.works === null || model.worksCount === 0

  const { data } = useQuery(aiModelQuery, {
    skip: isEmpty || authContext.isLoading || authContext.isNotLoggedIn,
    variables: {
      search: model.name,
      offset: 32 * page,
      limit: 32,
      where: {
        ratings: props.isMoreRatings ? ["G", "R15"] : ["G"],
        isSensitive: false,
        hasPrompt: props.hasPrompt,
        ...(props.hasPrompt && {
          isPromptPublic: true,
        }),
      },
    },
    fetchPolicy: "cache-first",
  })

  const aiModel = readFragment(ModelItemFragment, data?.aiModel)

  const works = isEmpty ? [] : (aiModel?.works ?? model.works)

  // URLパラメータの監視と更新
  // ページを変えたときだけ書き換える（開いただけで書き換えると、ローダーを取り直して通信が 1 回増える）
  useEffect(() => {
    if (isEmpty || page === props.page) return
    setSearchParams({
      page: String(page),
      prompt: props.hasPrompt ? "1" : "0",
      r15: props.isMoreRatings ? "1" : "0",
    })
  }, [
    isEmpty,
    page,
    props.page,
    props.hasPrompt,
    props.isMoreRatings,
    setSearchParams,
  ])

  if (isEmpty) {
    return (
      <div className="text-center">
        <p>作品がありません</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col space-y-4">
      <AiModelHeader
        name={model.name}
        thumbnailImageURL={works[0]?.largeThumbnailImageURL ?? null}
        isMoreRatings={props.isMoreRatings}
        hasPrompt={props.hasPrompt}
        worksCount={model.worksCount}
      />
      <div className="space-y-4">
        <ResponsivePhotoWorksAlbum
          works={
            works as unknown as FragmentOf<typeof PhotoAlbumWorkFragment>[]
          }
          targetRowHeight={240}
          size="small"
          isShowProfile={true}
          priorityCount={4}
        />
        <div className="h-8" />
        <div className="-translate-x-1/2 fixed bottom-0 left-1/2 z-10 w-full border-border/40 bg-background/95 p-2 backdrop-blur-sm supports-backdrop-filter:bg-background/80">
          <ResponsivePagination
            perPage={16}
            maxCount={model.worksCount}
            currentPage={page}
            onPageChange={(page: number) => setPage(page)}
          />
        </div>
      </div>
    </div>
  )
}

export const ModelItemFragment = graphql(
  `fragment ModelItem on AiModelNode {
      id
      name
      type
      worksCount
      generationModelId
      workModelId
      thumbnailImageURL
      works(offset: $offset, limit: $limit, where: $where) {
        ...WorkListItem
      }
  }`,
  [WorkListItemFragment],
)

// route.tsx と循環して読み込むと初期化の順番で例外になるので、ここに置く
export const aiModelQuery = graphql(
  `query AiModel($search: String!, $offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    aiModel(where:{search: $search}) {
      ...ModelItem
    }
  }`,
  [ModelItemFragment],
)
