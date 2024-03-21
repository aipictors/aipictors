import { useCachedImageGenerationTask } from "@/app/[lang]/generation/_hooks/use-cached-image-generation-task"
import { useGenerationContext } from "@/app/[lang]/generation/_hooks/use-generation-context"
import { GenerationTaskSheetView } from "@/app/[lang]/generation/tasks/[task]/_components/generation-task-sheet-view"
import { ErrorResultCard } from "@/app/[lang]/generation/tasks/_components/error-result-card"
import { GenerationTaskEditableCard } from "@/app/[lang]/generation/tasks/_components/generation-task-editable-card"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import type { ImageGenerationTaskFieldsFragment } from "@/graphql/__generated__/graphql"
import { ErrorBoundary } from "@sentry/nextjs"
import { useState } from "react"

type Props = {
  task: ImageGenerationTaskFieldsFragment
  taskIds?: string[]
  sizeType: number
  onRestore?(taskId: string): void
  onCancel?(): void
}

/**
 * 画像生成の履歴
 * @returns
 */
export function GenerationTaskDialogButton(props: Props) {
  const [isOpen, setIsOpen] = useState<boolean>(false)

  const context = useGenerationContext()

  const imageGenerationTask = context.config.viewTaskId
    ? useCachedImageGenerationTask(context.config.viewTaskId)
    : props.task

  if (imageGenerationTask === null) {
    return null
  }

  const onClickTask = () => {
    setTimeout(() => {
      if (props.taskIds?.length) {
        context.updateViewTask(props.task.id, props.taskIds)
      }
    }, 100)

    setIsOpen(true)
  }

  return (
    <>
      <ErrorBoundary key={props.task.id} fallback={ErrorResultCard}>
        <GenerationTaskEditableCard
          taskNanoid={props.task.nanoid}
          estimatedSeconds={props.task.estimatedSeconds ?? 0}
          taskId={props.task.id}
          token={props.task.token}
          thumbnailToken={props.task.thumbnailToken}
          task={props.task}
          optionButtonSize={props.sizeType}
          isSelectDisabled={true}
          isPreviewByHover={false}
          rating={props.task.rating ?? 0}
          isProtected={props.task.isProtected ?? false}
          onClick={onClickTask}
          onCancel={props.onCancel}
        />
        <Dialog
          open={isOpen}
          onOpenChange={(isOpen) => {
            if (!isOpen && props.onCancel) {
              props.onCancel()
            }
            setTimeout(() => {
              if (props.taskIds?.length) {
                context.updateViewTask(props.task.id, props.taskIds)
              }
            }, 100)
            setIsOpen((prev) => (prev !== isOpen ? isOpen : prev))
          }}
        >
          <DialogContent className="flex flex-col gap-0 p-0">
            <GenerationTaskSheetView
              isScroll={true}
              task={imageGenerationTask}
              isReferenceLink={true}
            />
          </DialogContent>
        </Dialog>
      </ErrorBoundary>
    </>
  )
}
