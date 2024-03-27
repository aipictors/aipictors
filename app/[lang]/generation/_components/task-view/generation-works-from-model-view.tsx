"use client"

import { GenerationViewCard } from "@/app/[lang]/generation/_components/generation-view-card"
import { GenerationWorkActionDropdownMenu } from "@/app/[lang]/generation/_components/task-view/generation-work-action-dropdown-menu"
import { GenerationWorkList } from "@/app/[lang]/generation/_components/task-view/generation-work-list"
import { GenerationTaskListActions } from "@/app/[lang]/generation/_components/task-view/generation-work-list-actions"
import { GenerationConfigContext } from "@/app/[lang]/generation/_contexts/generation-config-context"
import { useGenerationContext } from "@/app/[lang]/generation/_hooks/use-generation-context"
import { Button } from "@/components/ui/button"
import { worksQuery } from "@/graphql/queries/work/works"
import { createClient } from "@/lib/client"
import { useState } from "react"

/**
 * モデルから作品検索
 * @param props
 * @returns
 */
export const GenerationWorkListModelView = async () => {
  const { send } = GenerationConfigContext.useActorRef()

  const onCancel = () => {
    send({ type: "CLOSE" })
  }

  const context = useGenerationContext()

  const [isPreviewMode, togglePreviewMode] = useState(false)

  const state = GenerationConfigContext.useSelector((snap) => {
    return snap.value
  })

  const client = createClient()

  const worksResp = await client.query({
    query: worksQuery,
    variables: {
      offset: 0,
      limit: 64,
      where: {
        isFeatured: true,
        hasGenerationPrompt: true,
        generationModelId: context.config.searchModelId,
      },
    },
  })

  /**
   * サムネイルサイズ
   */
  const thumbnailSize = () => {
    if (state === "SEARCH_WORKS_FROM_MODEL") {
      return context.config.thumbnailSizeInHistoryListFull
    }
    return context.config.thumbnailSizeInPromptView
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
    if (state === "SEARCH_WORKS_FROM_MODEL") {
      return context.updateThumbnailSizeInHistoryListFull(value)
    }
    return context.updateThumbnailSizeInPromptView(value)
  }

  return (
    <GenerationViewCard
      title={"作品検索"}
      tooltip={"モデルから作品検索して参考にすることが可能です。"}
    >
      <Button className="mx-4 my-2" variant={"secondary"} onClick={onCancel}>
        {"閉じる（Escape）"}
      </Button>
      <GenerationTaskListActions
        thumbnailSize={thumbnailSize()}
        setThumbnailSize={updateThumbnailSize}
      />
      <GenerationWorkList
        works={worksResp}
        onCancel={onCancel}
        thumbnailSize={thumbnailSize()}
      />
    </GenerationViewCard>
  )
}
