import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { GenerationViewCard } from "~/routes/($lang).generation._index/components/generation-view-card"
import {
  GenerationWorkList,
  GenerationWorkListItemFragment,
} from "~/routes/($lang).generation._index/components/task-view/generation-work-list"
import { GenerationWorkListActions } from "~/routes/($lang).generation._index/components/task-view/generation-work-list-actions"
import { GenerationConfigContext } from "~/routes/($lang).generation._index/contexts/generation-config-context"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import { useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { useState } from "react"

/**
 * モデルから作品検索
 */
export function GenerationWorkListModelView () {
  const { send } = GenerationConfigContext.useActorRef()

  const context = useGenerationContext()

  const [isPreviewMode, togglePreviewMode] = useState(false)

  const [word, setWord] = useState("")

  const [sortType, setSortType] =
    useState<IntrospectionEnum<"WorkOrderBy">>("LIKES_COUNT")

  const state = GenerationConfigContext.useSelector((snap) => {
    return snap.value
  })

  const { data: worksResp, loading } = useQuery(worksQuery, {
    variables: {
      limit: 64,
      offset: 0,
      where: {
        tagNames: [word],
        ratings: ["G", "R15"],
        isSensitive: false,
        isFeatured: true,
        hasPrompt: true,
        isPromptPublic: true,
        ...(context.config.searchModelId && {
          generationModelId: context.config.searchModelId,
        }),
        orderBy: sortType,
      },
    },
  })

  /**
   * サムネイルサイズ
   */
  const thumbnailSize = () => {
    if (state === "WORK_LIST_FULL") {
      return context.config.thumbnailSizeInHistoryListFull
    }
    return context.config.thumbnailSizeInPromptView
  }

  /**
   * 一覧を閉じる
   */
  const onCancel = () => {
    send({ type: "CLOSE" })
  }

  /**
   * プレビューモードを切り替える
   */
  const onTogglePreviewMode = () => {
    togglePreviewMode((value) => !value)
  }

  /**
   * サムネイルサイズを変更する
   * @param value
   * @returns
   */
  const updateThumbnailSize = (value: number) => {
    if (state === "WORK_LIST_FULL") {
      return context.updateThumbnailSizeInHistoryListFull(value)
    }
    return context.updateThumbnailSizeInPromptView(value)
  }

  return (
    <GenerationViewCard>
      <GenerationWorkListActions
        sortType={sortType}
        showHistoryExpandButton={true}
        thumbnailSize={thumbnailSize()}
        setThumbnailSize={updateThumbnailSize}
        onTogglePreviewMode={onTogglePreviewMode}
        onChangeSortType={setSortType}
        onChangeWord={setWord}
      />
      <GenerationWorkList
        loading={loading}
        works={worksResp?.works ?? []}
        onCancel={onCancel}
        thumbnailSize={thumbnailSize()}
        isPreviewByHover={isPreviewMode}
      />
    </GenerationViewCard>
  )
}

const worksQuery = graphql(
  `query Works($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...GenerationWorkListItem
    }
  }`,
  [GenerationWorkListItemFragment],
)
