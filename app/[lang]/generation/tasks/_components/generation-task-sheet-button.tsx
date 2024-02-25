import { ThumbnailImageSizeType } from "@/app/[lang]/generation/_types/thumbnail-image-size-type"
import { GenerationTaskSheetView } from "@/app/[lang]/generation/tasks/[task]/_components/generation-task-sheet-view"
import { GenerationTaskCard } from "@/app/[lang]/generation/tasks/_components/generation-task-card"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
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
export function GenerationTaskSheetButton(props: Props) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <GenerationTaskCard
          taskNanoid={props.task.nanoid}
          taskId={props.task.id}
          estimatedSeconds={props.task.estimatedSeconds ?? 0}
          token={props.task.token}
          optionButtonSize={props.sizeType}
          rating={props.task.rating ?? 0}
          onCancel={props.onCancel}
        />
      </SheetTrigger>
      <SheetContent side={"right"} className="p-0 flex flex-col gap-0">
        <GenerationTaskSheetView
          task={props.task}
          onRestore={props.onRestore}
        />
      </SheetContent>
    </Sheet>
  )
}
