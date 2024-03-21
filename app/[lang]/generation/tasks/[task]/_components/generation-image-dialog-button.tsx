import { useGenerationContext } from "@/app/[lang]/generation/_hooks/use-generation-context"
import { GenerationTaskContentImagePlaceHolder } from "@/app/[lang]/generation/tasks/[task]/_components/generation-task-content-image-place-holder"
import { PrivateImage } from "@/app/_components/private-image"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Suspense } from "react"

type Props = {
  taskId: string
  taskToken: string | null
  children: React.ReactNode
  isAbsolute?: boolean
}

/**
 * 生成画像のダイアログのボタン
 * @param props
 * @returns
 */
export function GenerationImageDialogButton(props: Props) {
  const context = useGenerationContext()

  return (
    <Dialog>
      <DialogTrigger
        className={
          props.isAbsolute === true
            ? "absolute right-2 bottom-2 rounded-full hover:opacity-80"
            : "m-auto block"
        }
      >
        <span>{props.children}</span>
      </DialogTrigger>
      <DialogContent className={"max-h-[96vh] w-[auto] max-w-[96vw]"}>
        <Suspense
          fallback={
            <GenerationTaskContentImagePlaceHolder
              className={"m-auto h-72 max-h-96 w-72 max-w-['50vw']"}
            />
          }
        >
          <PrivateImage
            className={"m-auto h-[auto] max-h-[88vh] max-w-[88vw]"}
            taskId={props.taskId}
            token={props.taskToken as string}
            isThumbnail={false}
            alt={"-"}
          />
        </Suspense>
      </DialogContent>
    </Dialog>
  )
}
