import { Dialog, DialogContent } from "~/components/ui/dialog"
import { GeminiImageModificationDialog } from "~/routes/($lang).generation._index/components/submission-view/gemini-image-modification-dialog"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import { ErrorResultCard } from "~/routes/($lang).generation._index/components/error-result-card"
import {
  EditableGenerationResultCardFragment,
  EditableGenerationResultCardTaskFragment,
  GenerationTaskEditableCard,
} from "~/routes/($lang).generation._index/components/generation-task-editable-card"
import {
  GenerationImageResultSheetFragment,
  GenerationImageResultSheetTaskFragment,
  GenerationTaskSheetView,
} from "~/routes/($lang).generation._index/components/generation-task-sheet-view"
import { useState } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { graphql, type FragmentOf } from "gql.tada"
import { normalizeGenerativeFileUrl } from "~/utils/normalize-generative-file-url"

type Props = {
  task:
    | FragmentOf<typeof GenerationResultDialogButtonFragment>
    | FragmentOf<typeof GenerationResultDialogButtonTaskFragment>
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
export function GenerationTaskDialogButton (props: Props) {
  const [isOpen, setIsOpen] = useState<boolean>(false)

  const [showAiModificationDialog, setShowAiModificationDialog] =
    useState(false)

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
        {showAiModificationDialog &&
          props.userToken &&
          props.task.imageUrl &&
          userNanoid && (
            <GeminiImageModificationDialog
              isOpen={showAiModificationDialog}
              onClose={() => setShowAiModificationDialog(false)}
              taskId={props.task.id}
              token={props.userToken}
              imageUrl={normalizeGenerativeFileUrl(props.task.imageUrl)}
              userNanoid={userNanoid}
              originalPrompt={props.task.prompt || ""}
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
              isReferenceLink={false}
              setShowAiModificationDialog={(value) => {
                setShowAiModificationDialog(value)
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

export const GenerationResultDialogButtonFragment = graphql(
  `fragment GenerationResultDialogButton on ImageGenerationResultNode @_unmask {
    ...EditableGenerationResultCard
    ...GenerationImageResultSheet
  }`,
  [EditableGenerationResultCardFragment, GenerationImageResultSheetFragment],
)

export const GenerationResultDialogButtonTaskFragment = graphql(
  `fragment GenerationResultDialogButtonTask on ImageGenerationTaskNode @_unmask {
    ...EditableGenerationResultCardTask
    ...GenerationImageResultSheetTask
  }`,
  [
    EditableGenerationResultCardTaskFragment,
    GenerationImageResultSheetTaskFragment,
  ],
)
