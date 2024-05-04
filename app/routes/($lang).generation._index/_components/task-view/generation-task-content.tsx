import { AuthContext } from "@/_contexts/auth-context"
import type {
  ImageGenerationSizeType,
  ImageGenerationStatus,
  ImageGenerationType,
} from "@/_graphql/__generated__/graphql"
import { imageGenerationTaskQuery } from "@/_graphql/queries/image-generation/image-generation-task"
import { GenerationTaskError } from "@/routes/($lang).generation._index/_components/task-view/generation-task-error"
import { useGenerationContext } from "@/routes/($lang).generation._index/_hooks/use-generation-context"
import { GenerationTaskSheetView } from "@/routes/($lang).generation._index/_components/generation-task-sheet-view"
import { skipToken, useSuspenseQuery } from "@apollo/client/index.js"
import { useContext } from "react"
import { ErrorBoundary } from "react-error-boundary"

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
      <ErrorBoundary fallback={<GenerationTaskError />}>
        <GenerationTaskSheetView
          task={{
            ...imageGenerationTask,
            status: imageGenerationTask.status as ImageGenerationStatus,
            sizeType: imageGenerationTask.sizeType as ImageGenerationSizeType,
            generationType:
              imageGenerationTask.generationType as ImageGenerationType,
          }}
        />
      </ErrorBoundary>
    </>
  )
}
