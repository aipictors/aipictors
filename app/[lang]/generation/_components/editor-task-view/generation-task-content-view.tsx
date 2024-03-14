"use client"

import { useGenerationContext } from "@/app/[lang]/generation/_hooks/use-generation-context"
import { PrivateImage } from "@/app/_components/private-image"
import { AuthContext } from "@/app/_contexts/auth-context"
import { Card } from "@/components/ui/card"
import { imageGenerationTaskQuery } from "@/graphql/queries/image-generation/image-generation-task"
import { useSuspenseQuery } from "@apollo/client"
import { skipToken } from "@apollo/client"
import { useContext } from "react"

/**
 * タスク内容
 * @param props
 * @returns
 */
export const GenerationTaskContentPreview = () => {
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
      <Card className="flex h-[100vh] w-auto flex-col">
        <div className="m-auto max-h-[100vh]">
          <PrivateImage
            // biome-ignore lint/nursery/useSortedClasses: <explanation>
            className={`max-h-[72vh] generation-image-${imageGenerationTask.id}`}
            taskId={imageGenerationTask.id}
            token={imageGenerationTask.token ?? ""}
            alt={"-"}
          />
          <div className="m-auto mb-1">
            <p className="mb-1 font-semibold">{"Model"}</p>
            <p>{imageGenerationTask.model?.name}</p>
          </div>
        </div>
      </Card>
    </>
  )
}
