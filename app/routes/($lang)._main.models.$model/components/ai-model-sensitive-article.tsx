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
import { aiModelQuery } from "~/routes/($lang)._main.models.$model/components/ai-model-article"
import type { AiModelGenerationInfo } from "~/routes/($lang)._main.models.$model/components/ai-model-header"
import type { AiModelRelatedModel } from "~/routes/($lang)._main.models.$model/components/ai-model-related"
import { AiModelWorksLayout } from "~/routes/($lang)._main.models.$model/components/ai-model-works-layout"

type Props = {
  model: FragmentOf<typeof ModelSensitiveItemFragment>
  search: AiModelWorksSearch
  generation: AiModelGenerationInfo | null
  relatedModels: AiModelRelatedModel[]
}

export function AiModelSensitiveArticle(props: Props) {
  const model = readFragment(ModelSensitiveItemFragment, props.model)

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
        ratings: props.search.isMoreRatings ? ["R18", "R18G"] : ["R18"],
        isSensitive: true,
        hasPrompt: props.search.hasPrompt,
        orderBy: toAiModelWorksOrderBy(props.search.sort),
        ...(props.search.hasPrompt && {
          isPromptPublic: true,
        }),
      },
    },
    fetchPolicy: "cache-first",
  })

  const aiModel = readFragment(ModelSensitiveItemFragment, data?.aiModel)

  const works = isEmpty ? [] : (aiModel?.works ?? model.works)

  return (
    <AiModelWorksLayout
      name={model.name}
      thumbnailImageURL={model.thumbnailImageURL}
      worksCount={model.worksCount}
      works={works}
      search={props.search}
      isSensitive={true}
      generation={props.generation}
      relatedModels={props.relatedModels}
      promptHubPath={null}
    />
  )
}

export const ModelSensitiveItemFragment = graphql(
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
