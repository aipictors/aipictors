import { GenerationTaskCacheView } from "@/app/[lang]/generation/tasks/[task]/_components/generation-task-cache-view"
import { GenerationTaskCard } from "@/app/[lang]/generation/tasks/_components/generation-task-card"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ImageGenerationTaskFieldsFragment } from "@/graphql/__generated__/graphql"

type Props = {
  task: ImageGenerationTaskFieldsFragment
  sizeType: string
  isDialog?: boolean
  onRestore?(taskId: string): void
  onCancel?(): void
}

/**
 * 画像生成の履歴
 * @returns
 */
export function GenerationTaskViewButton(props: Props) {
  if (props.isDialog)
    return (
      <Dialog>
        <DialogTrigger>
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
          <GenerationTaskCacheView
            isScroll={true}
            task={props.task}
            onRestore={props.onRestore}
          />
        </DialogContent>
      </Dialog>
    )

  return (
    <Sheet>
      <SheetTrigger>
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
        <GenerationTaskCacheView
          task={props.task}
          onRestore={props.onRestore}
        />
      </SheetContent>
    </Sheet>
  )
}
