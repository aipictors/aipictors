import {
  AI_MODEL_WORKS_PER_PAGE,
  type AiModelWorksSearch,
  toAiModelWorksOrderBy,
} from "~/routes/($lang)._main.models.$model/ai-model-works-page"
import { graphql, readFragment, type FragmentOf } from "gql.tada"
import { useContext } from "react"
import { useQuery } from "@apollo/client/index"
import { AuthContext } from "~/contexts/auth-context"
import { WorkListItemFragment } from "~/routes/($lang)._main.posts._index/components/work-list"
import type { AiModelGenerationInfo } from "~/routes/($lang)._main.models.$model/components/ai-model-header"
import type { AiModelRelatedModel } from "~/routes/($lang)._main.models.$model/components/ai-model-related"
import type { ModelDetail } from "~/lib/model-details/model-detail"
import { AiModelWorksLayout } from "~/routes/($lang)._main.models.$model/components/ai-model-works-layout"

type Props = {
  model: FragmentOf<typeof ModelItemFragment>
  search: AiModelWorksSearch
  generation: AiModelGenerationInfo | null
  relatedModels: AiModelRelatedModel[]
  detail: ModelDetail | null
  promptHubPath: string | null
}

export function AiModelArticle(props: Props) {
  const model = readFragment(ModelItemFragment, props.model)

  const authContext = useContext(AuthContext)

  const isEmpty = model.worksCount === 0 || model.works.length === 0

  // ログイン中は自分のいいねの状態を付けて取り直す（ローダーは未ログイン扱いで取る）
  const { data } = useQuery(aiModelQuery, {
    skip: isEmpty || authContext.isLoading || authContext.isNotLoggedIn,
    variables: {
      search: model.name,
      offset: AI_MODEL_WORKS_PER_PAGE * props.search.page,
      limit: AI_MODEL_WORKS_PER_PAGE,
      where: {
        ratings: props.search.isMoreRatings ? ["G", "R15"] : ["G"],
        isSensitive: false,
        hasPrompt: props.search.hasPrompt,
        orderBy: toAiModelWorksOrderBy(props.search.sort),
        ...(props.search.hasPrompt && {
          isPromptPublic: true,
        }),
      },
    },
    fetchPolicy: "cache-first",
  })

  const aiModel = readFragment(ModelItemFragment, data?.aiModel)

  const works = isEmpty ? [] : (aiModel?.works ?? model.works)

  return (
    <AiModelWorksLayout
      name={model.name}
      thumbnailImageURL={model.thumbnailImageURL}
      worksCount={model.worksCount}
      works={works}
      search={props.search}
      isSensitive={false}
      generation={props.generation}
      relatedModels={props.relatedModels}
      detail={props.detail}
      promptHubPath={props.promptHubPath}
    />
  )
}

export const ModelItemFragment = graphql(
  `fragment ModelItem on AiModelNode {
      id
      name
      type
      worksCount(where: $where)
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

/**
 * 画像生成のモデル（「このモデルで生成」と似ているモデルに使う）
 */
export const aiModelImageModelsQuery = graphql(
  `query AiModelImageModels {
    imageModels {
      id
      modelName
      displayName
      explanation
      type
      style
      thumbnailImageURL
    }
  }`,
)
