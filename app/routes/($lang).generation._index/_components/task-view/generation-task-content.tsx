import { AuthContext } from "@/_contexts/auth-context"
import { imageGenerationTaskQuery } from "@/_graphql/queries/image-generation/image-generation-task"
import { GenerationTaskError } from "@/routes/($lang).generation._index/_components/task-view/generation-task-error"
import { useGenerationContext } from "@/routes/($lang).generation._index/_hooks/use-generation-context"
import { GenerationTaskSheetView } from "@/routes/($lang).generation._index/_components/generation-task-sheet-view"
import { skipToken, useSuspenseQuery } from "@apollo/client/index"
import { useContext } from "react"
import { ErrorBoundary } from "react-error-boundary"
import type { IntrospectionEnum } from "@/_lib/introspection-enum"

/**
 * タスク詳細内容
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
      <ErrorBoundary fallback={<GenerationTaskError />}>
        <GenerationTaskSheetView
          task={{
            ...imageGenerationTask,
            status:
              imageGenerationTask.status as IntrospectionEnum<"ImageGenerationStatus">,
            sizeType:
              imageGenerationTask.sizeType as IntrospectionEnum<"ImageGenerationSizeType">,
            generationType:
              imageGenerationTask.generationType as IntrospectionEnum<"ImageGenerationType">,
          }}
        />
      </ErrorBoundary>
    </>
  )
}
