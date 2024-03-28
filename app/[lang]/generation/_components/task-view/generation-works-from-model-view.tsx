"use client"

import { GenerationViewCard } from "@/app/[lang]/generation/_components/generation-view-card"
import { GenerationWorkActionDropdownMenu } from "@/app/[lang]/generation/_components/task-view/generation-work-action-dropdown-menu"
import { GenerationWorkList } from "@/app/[lang]/generation/_components/task-view/generation-work-list"
import { GenerationTaskListActions } from "@/app/[lang]/generation/_components/task-view/generation-work-list-actions"
import { GenerationConfigContext } from "@/app/[lang]/generation/_contexts/generation-config-context"
import { useGenerationContext } from "@/app/[lang]/generation/_hooks/use-generation-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { worksQuery } from "@/graphql/queries/work/works"
import { createClient } from "@/lib/client"
import { useQuery } from "@apollo/client"
import { useState } from "react"

/**
 * モデルから作品検索
 * @param props
 * @returns
 */
export const GenerationWorkListModelView = () => {
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

  const [word, setWord] = useState("")

  const { data: worksResp } = useQuery(worksQuery, {
    variables: {
      limit: 32,
      offset: 0,
      where: {
        isFeatured: true,
        hasGenerationPrompt: true,
        generationModelId: context.config.searchModelId,
        search: word,
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
    <GenerationViewCard
      title={"作品検索"}
      tooltip={"モデルから作品検索して参考にすることが可能です。"}
    >
      <Button className="mx-4 my-2" variant={"secondary"} onClick={onCancel}>
        {"閉じる"}
        <span className="hidden md:inline-block">{"（Escape）"}</span>
      </Button>
      <Input
        minLength={1}
        maxLength={120}
        required
        type="text"
        name="title"
        placeholder="検索ワード"
        className="mx-4 mb-2 max-w-96"
        onChange={(event) => {
          setWord(event.target.value)
        }}
      />
      <GenerationTaskListActions
        thumbnailSize={thumbnailSize()}
        setThumbnailSize={updateThumbnailSize}
        onTogglePreviewMode={onTogglePreviewMode}
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
