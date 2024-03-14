"use client"

import { useGenerationContext } from "@/app/[lang]/generation/_hooks/use-generation-context"
import { GenerationTaskSheetView } from "@/app/[lang]/generation/tasks/[task]/_components/generation-task-sheet-view"
import { AuthContext } from "@/app/_contexts/auth-context"
import type {
  ImageGenerationSizeType,
  ImageGenerationStatus,
  ImageGenerationType,
} from "@/graphql/__generated__/graphql"
import { imageGenerationTaskQuery } from "@/graphql/queries/image-generation/image-generation-task"
import { skipToken, useSuspenseQuery } from "@apollo/client"
import { useContext } from "react"

/**
 * タスク詳細内容
 * @param props
 * @returns
 */
export const GenerationTaskContent = () => {
  const context = useGenerationContext()

  if (context.config.previewTaskId === null) {
    return null
  }

  const authContext = useContext(AuthContext)

  const { data } = useSuspenseQuery(
    imageGenerationTaskQuery,
    authContext.isLoggedIn
      ? {
          variables: {
            id: context.config.previewTaskId,
          },
          fetchPolicy: "cache-first",
        }
      : skipToken,
  )

  const imageGenerationTask = data?.imageGenerationTask
  if (imageGenerationTask === null || imageGenerationTask === undefined) {
    return null
  }

  return (
    <>
      <GenerationTaskSheetView
        task={{
          ...imageGenerationTask,
          status: imageGenerationTask.status as ImageGenerationStatus,
          sizeType: imageGenerationTask.sizeType as ImageGenerationSizeType,
          generationType:
            imageGenerationTask.generationType as ImageGenerationType,
        }}
      />
    </>
  )
}
