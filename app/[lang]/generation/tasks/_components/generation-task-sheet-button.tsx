import { GenerationTaskSheetView } from "@/app/[lang]/generation/tasks/[task]/_components/generation-task-sheet-view"
import { GenerationTaskEditableCard } from "@/app/[lang]/generation/tasks/_components/generation-task-editable-card"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import type { ImageGenerationTaskFieldsFragment } from "@/graphql/__generated__/graphql"
import { useState } from "react"

type Props = {
  task: ImageGenerationTaskFieldsFragment
  sizeType: number
  onRestore?(taskId: string): void
  onCancel?(): void
}

/**
 * 画像生成の履歴
 * @returns
 */
export function GenerationTaskSheetButton(props: Props) {
  const [isOpen, setIsOpen] = useState<boolean>(false)

  return (
    <>
      <GenerationTaskEditableCard
        taskNanoid={props.task.nanoid}
        taskId={props.task.id}
        estimatedSeconds={props.task.estimatedSeconds ?? 0}
        token={props.task.token}
        optionButtonSize={props.sizeType}
        task={props.task}
        thumbnailToken={props.task.thumbnailToken}
        isSelectDisabled={true}
        isPreviewByHover={true}
        rating={props.task.rating ?? 0}
        onClick={() => {
          setIsOpen(true)
        }}
        onCancel={props.onCancel}
      />
      <Sheet
        open={isOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen && props.onCancel) {
            props.onCancel()
          }
          setIsOpen((prev) => (prev !== isOpen ? isOpen : prev))
        }}
      >
        <SheetContent side={"right"} className="flex flex-col gap-0 p-0">
          <GenerationTaskSheetView task={props.task} />
        </SheetContent>
      </Sheet>
    </>
  )
}
