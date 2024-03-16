import { useGenerationContext } from "@/app/[lang]/generation/_hooks/use-generation-context"
import { PrivateImage } from "@/app/_components/private-image"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"

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
        <PrivateImage
          className={"m-auto h-[auto] max-h-[88vh] max-w-[88vw]"}
          taskId={props.taskId}
          token={props.taskToken as string}
          isThumbnail={context.config.taskListThumbnailType === "light"}
          alt={"-"}
        />
      </DialogContent>
    </Dialog>
  )
}
