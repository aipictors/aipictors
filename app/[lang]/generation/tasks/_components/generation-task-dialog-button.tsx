import { ThumbnailImageSizeType } from "@/app/[lang]/generation/_types/thumbnail-image-size-type"
import { GenerationTaskSheetView } from "@/app/[lang]/generation/tasks/[task]/_components/generation-task-sheet-view"
import { GenerationTaskCard } from "@/app/[lang]/generation/tasks/_components/generation-task-card"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { ImageGenerationTaskFieldsFragment } from "@/graphql/__generated__/graphql"

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
  return (
    <Dialog>
      <DialogTrigger asChild>
        <GenerationTaskCard
          taskNanoid={props.task.nanoid}
          estimatedSeconds={props.task.estimatedSeconds ?? 0}
          taskId={props.task.id}
          token={props.task.token}
          optionButtonSize={props.sizeType}
          rating={props.task.rating ?? 0}
          onCancel={props.onCancel}
        />
      </DialogTrigger>
      <DialogContent className="p-0 flex flex-col gap-0">
        <GenerationTaskSheetView
          isScroll={true}
          task={props.task}
          onRestore={props.onRestore}
        />
      </DialogContent>
    </Dialog>
  )
}
