"use client"

import { useGenerationContext } from "@/app/[lang]/generation/_hooks/use-generation-context"
import { GenerationTaskSheetView } from "@/app/[lang]/generation/tasks/[task]/_components/generation-task-sheet-view"
import { AuthContext } from "@/app/_contexts/auth-context"
import { ScrollArea } from "@/components/ui/scroll-area"
import type {
  ImageGenerationSizeType,
  ImageGenerationStatus,
  ImageGenerationType,
} from "@/graphql/__generated__/graphql"
import { imageGenerationTaskQuery } from "@/graphql/queries/image-generation/image-generation-task"
import { useSuspenseQuery } from "@apollo/client"
import { skipToken, useQuery } from "@apollo/client"
import { useContext } from "react"

/**
 * 画像生成履歴の詳細
 * @returns
 */
export const GenerationTaskDetails = () => {
  const context = useGenerationContext()

  const authContext = useContext(AuthContext)

  if (authContext === null || context.config.viewTaskId === null) {
    return null
  }

  const { data } = useSuspenseQuery(
    imageGenerationTaskQuery,
    authContext.isLoggedIn
      ? {
          variables: {
            id: context.config.viewTaskId,
          },
          fetchPolicy: "cache-first",
        }
      : skipToken,
  )

  const imageGenerationTask = data?.imageGenerationTask

  return (
    <>
      <ScrollArea className="absolute pb-64 md:pb-0">
        {imageGenerationTask && (
          <GenerationTaskSheetView
            task={{
              ...imageGenerationTask,
              status: imageGenerationTask.status as ImageGenerationStatus,
              sizeType: imageGenerationTask.sizeType as ImageGenerationSizeType,
              generationType:
                imageGenerationTask.generationType as ImageGenerationType,
            }}
          />
        )}
      </ScrollArea>
    </>
  )
}
