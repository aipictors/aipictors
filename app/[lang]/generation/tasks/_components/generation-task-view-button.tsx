import { GenerationTaskCacheView } from "@/app/[lang]/generation/tasks/[task]/_components/generation-task-cache-view"
import { GenerationTaskCard } from "@/app/[lang]/generation/tasks/_components/generation-task-card"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ImageGenerationTaskNode } from "@/graphql/__generated__/graphql"

type Props = {
  task: ImageGenerationTaskNode
  pcViewType: string
  onRestore?(taskId: string): void
}

/**
 * 画像生成の履歴
 * @returns
 */
export function GenerationTaskViewButton(props: Props) {
  if (props.pcViewType === "dialog")
    return (
      <Dialog>
        <DialogTrigger asChild>
          <GenerationTaskCard
            taskNanoid={props.task.nanoid}
            remainingSeconds={props.task.estimatedSeconds ?? 0}
            taskId={props.task.id}
            token={props.task.token}
            rating={props.task.rating ?? 0}
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
      <SheetTrigger asChild>
        <GenerationTaskCard
          taskNanoid={props.task.nanoid}
          taskId={props.task.id}
          remainingSeconds={props.task.estimatedSeconds ?? 0}
          token={props.task.token}
          rating={props.task.rating ?? 0}
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
