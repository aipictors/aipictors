import { ThumbnailImageSizeType } from "@/app/[lang]/generation/_types/thumbnail-image-size-type"
import { GenerationTaskSheetView } from "@/app/[lang]/generation/tasks/[task]/_components/generation-task-sheet-view"
import { GenerationTaskEditableCard } from "@/app/[lang]/generation/tasks/_components/generation-task-editable-card"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { ImageGenerationTaskFieldsFragment } from "@/graphql/__generated__/graphql"
import { useState } from "react"

type Props = {
  task: ImageGenerationTaskFieldsFragment
  sizeType: ThumbnailImageSizeType
  onRestore?(taskId: string): void
  onCancel?(): void
}

/**
 * 画像生成の履歴
 * @returns
 */
export function GenerationTaskDialogButton(props: Props) {
  const [isOpen, setIsOpen] = useState<boolean>(false)

  return (
    <>
      <GenerationTaskEditableCard
        taskNanoid={props.task.nanoid}
        estimatedSeconds={props.task.estimatedSeconds ?? 0}
        taskId={props.task.id}
        token={props.task.token}
        optionButtonSize={props.sizeType}
        rating={props.task.rating ?? 0}
        onClick={() => {
          setIsOpen(true)
        }}
        onCancel={props.onCancel}
      />
      <Dialog
        open={isOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen && props.onCancel) {
            props.onCancel()
          }
          setIsOpen((prev) => (prev !== isOpen ? isOpen : prev))
        }}
      >
        <DialogContent className="p-0 flex flex-col gap-0">
          <GenerationTaskSheetView
            isScroll={true}
            task={props.task}
            onRestore={props.onRestore}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
