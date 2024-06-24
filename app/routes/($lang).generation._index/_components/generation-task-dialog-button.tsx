import { Dialog, DialogContent } from "@/_components/ui/dialog"
import { InPaintingDialog } from "@/routes/($lang).generation._index/_components/submission-view/in-painting-dialog"
import { useGenerationContext } from "@/routes/($lang).generation._index/_hooks/use-generation-context"
import { ErrorResultCard } from "@/routes/($lang).generation._index/_components/error-result-card"
import { GenerationTaskEditableCard } from "@/routes/($lang).generation._index/_components/generation-task-editable-card"
import { GenerationTaskSheetView } from "@/routes/($lang).generation._index/_components/generation-task-sheet-view"
import { useState } from "react"
import { ErrorBoundary } from "react-error-boundary"
import type { imageGenerationTaskFieldsFragment } from "@/_graphql/fragments/image-generation-task-field"
import type { FragmentOf } from "gql.tada"

type Props = {
  task: FragmentOf<typeof imageGenerationTaskFieldsFragment>
  taskIds?: string[]
  sizeType: number
  userToken: string
  onRestore?(taskId: string): void
  onCancel?(): void
  onDelete?(taskId: string): void
}

/**
 * 画像生成の履歴
 */
export function GenerationTaskDialogButton(props: Props) {
  const [isOpen, setIsOpen] = useState<boolean>(false)

  const [showInPaintDialog, setShowInPaintDialog] = useState(false)

  const context = useGenerationContext()

  const userNanoid = context.user?.nanoid ?? null

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
          userToken={props.userToken}
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
        {showInPaintDialog &&
          props.userToken &&
          props.task.imageUrl &&
          userNanoid && (
            <InPaintingDialog
              isOpen={showInPaintDialog}
              onClose={() => setShowInPaintDialog(false)}
              taskId={props.task.id}
              token={props.userToken}
              imageUrl={props.task.imageUrl}
              userNanoid={userNanoid}
              configSeed={props.task.seed}
              configSteps={props.task.steps}
              configSampler={props.task.sampler}
              configSizeType={props.task.sizeType}
              configModel={props.task.model?.name}
              configVae={props.task.vae}
              configScale={props.task.scale}
              configClipSkip={props.task.clipSkip}
            />
          )}
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
              setShowInPaintDialog={(value) => {
                setShowInPaintDialog(value)
                if (value) {
                  setIsOpen(false)
                } else {
                  setIsOpen(true)
                }
              }}
            />
          </DialogContent>
        </Dialog>
      </ErrorBoundary>
    </>
  )
}
