"use client"

import { GenerationViewCard } from "@/app/[lang]/generation/_components/generation-view-card"
import { GenerationWorkList } from "@/app/[lang]/generation/_components/task-view/generation-work-list"
import { GenerationWorkListActions } from "@/app/[lang]/generation/_components/task-view/generation-work-list-actions"
import { GenerationConfigContext } from "@/app/[lang]/generation/_contexts/generation-config-context"
import { useGenerationContext } from "@/app/[lang]/generation/_hooks/use-generation-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { WorkOrderBy } from "@/graphql/__generated__/graphql"
import { worksQuery } from "@/graphql/queries/work/works"
import { useQuery } from "@apollo/client"
import { useState } from "react"

/**
 * モデルから作品検索
 * @param props
 * @returns
 */
export const GenerationWorkListModelView = () => {
  const { send } = GenerationConfigContext.useActorRef()

  const context = useGenerationContext()

  const [isPreviewMode, togglePreviewMode] = useState(false)

  const [word, setWord] = useState("")

  const [sortType, setSortType] = useState<WorkOrderBy>("LIKES_COUNT")

  const state = GenerationConfigContext.useSelector((snap) => {
    return snap.value
  })

  const { data: worksResp } = useQuery(worksQuery, {
    variables: {
      limit: 64,
      offset: 0,
      where: {
        isFeatured: true,
        hasGenerationPrompt: true,
        ...(context.config.searchModelId && {
          generationModelId: context.config.searchModelId,
        }),
        search: word,
        orderBy: sortType,
      },
    },
  })

  /**
   * サムネイルサイズ
   */
  const thumbnailSize = () => {
    if (state === "WORKS_FROM_MODEL") {
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
    if (state === "WORKS_FROM_MODEL") {
      return context.updateThumbnailSizeInHistoryListFull(value)
    }
    return context.updateThumbnailSizeInPromptView(value)
  }

  return (
    <GenerationViewCard>
      {/* <Button
        id="generation-works-from-model-view"
        className="mx-4 my-2"
        variant={"secondary"}
        onClick={onCancel}
      >
        {"閉じる"}
        <span className="hidden md:inline-block">{"（Escape）"}</span>
      </Button> */}
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
        works={worksResp}
        onCancel={onCancel}
        thumbnailSize={thumbnailSize()}
        isPreviewByHover={isPreviewMode}
      />
    </GenerationViewCard>
  )
}
