"use client"

import { useGenerationContext } from "@/app/[lang]/generation/_hooks/use-generation-context"
import { GenerationTaskSheetView } from "@/app/[lang]/generation/tasks/[task]/_components/generation-task-sheet-view"
import { useFocusTimeout } from "@/app/_hooks/use-focus-timeout"
import { ScrollArea } from "@/components/ui/scroll-area"
import { config } from "@/config"
import {
  ImageGenerationSizeType,
  ImageGenerationStatus,
  ImageGenerationType,
} from "@/graphql/__generated__/graphql"
import { viewerImageGenerationTasksQuery } from "@/graphql/queries/viewer/viewer-image-generation-tasks"
import { useQuery } from "@apollo/client"
import { toast } from "sonner"

/**
 * 画像生成履歴の詳細
 * @param props
 * @returns
 */
export const GenerationTaskDetails = () => {
  const context = useGenerationContext()

  const isTimeout = useFocusTimeout()

  const { data: tasks } = useQuery(viewerImageGenerationTasksQuery, {
    variables: {
      limit: 64,
      offset: 0,
      where: {},
    },
    pollInterval: isTimeout ? 8000 : 2000,
  })

  const { data: ratingTasks } = useQuery(viewerImageGenerationTasksQuery, {
    variables: {
      limit: config.query.maxLimit,
      offset: 0,
      where: { minRating: 1 },
    },
  })

  if (tasks === undefined || ratingTasks === undefined) {
    return null
  }

  const imageGenerationTasks = tasks.viewer?.imageGenerationTasks ?? []

  const onRestore = (taskId: string) => {
    const task = tasks.viewer?.imageGenerationTasks.find(
      (task) => task.nanoid === taskId,
    )
    if (typeof task === "undefined") return
    context.updateSettings(
      task.model.id,
      task.steps,
      task.model.type,
      task.sampler,
      task.scale,
      task.vae ?? "",
      task.prompt,
      task.negativePrompt,
      task.seed,
      task.sizeType,
      task.clipSkip,
    )
    toast("設定を復元しました")
  }

  const imageGenerationTask = context.config.previewTask

  return (
    <>
      <ScrollArea className="pb-64 md:pb-0 absolute">
        {imageGenerationTask && (
          <GenerationTaskSheetView
            task={{
              ...imageGenerationTask,
              status: imageGenerationTask.status as ImageGenerationStatus,
              sizeType: imageGenerationTask.sizeType as ImageGenerationSizeType,
              generationType:
                imageGenerationTask.generationType as ImageGenerationType,
            }}
            onRestore={onRestore}
          />
        )}
      </ScrollArea>
    </>
  )
}
