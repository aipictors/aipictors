import { useGenerationContext } from "@/[lang]/generation/_hooks/use-generation-context"
import { GenerationTaskSheetView } from "@/[lang]/generation/tasks/[task]/_components/generation-task-sheet-view"
import { ErrorResultCard } from "@/[lang]/generation/tasks/_components/error-result-card"
import { GenerationTaskEditableCard } from "@/[lang]/generation/tasks/_components/generation-task-editable-card"
import { Dialog, DialogContent } from "@/_components/ui/dialog"
import type { ImageGenerationTaskFieldsFragment } from "@/_graphql/__generated__/graphql"
import { useState } from "react"
import { ErrorBoundary } from "react-error-boundary"

type Props = {
  task: ImageGenerationTaskFieldsFragment
  taskIds?: string[]
  sizeType: number
  onRestore?(taskId: string): void
  onCancel?(): void
  onDelete?(taskId: string): void
}

/**
 * 画像生成の履歴
 * @returns
 */
export function GenerationTaskDialogButton(props: Props) {
  const [isOpen, setIsOpen] = useState<boolean>(false)

  const context = useGenerationContext()

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
      <ErrorBoundary key={props.task.id} fallback={<ErrorResultCard />}>
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
          onDelete={props.onDelete}
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
              task={props.task}
              isReferenceLink={true}
            />
          </DialogContent>
        </Dialog>
      </ErrorBoundary>
    </>
  )
}
