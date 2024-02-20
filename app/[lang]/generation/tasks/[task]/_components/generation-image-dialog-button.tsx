import { PrivateImage } from "@/app/_components/private-image"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"

type Props = {
  taskId: string
  taskToken: string | null
}

/**
 * 生成画像のダイアログのボタン
 * @param props
 * @returns
 */
export function GenerationImageDialogButton(props: Props) {
  return (
    <Dialog>
      <DialogTrigger>
        <PrivateImage
          className={`max-h-screen m-auto generation-image-${props.taskId}`}
          taskId={props.taskId}
          token={props.taskToken as string}
          alt={"-"}
        />
      </DialogTrigger>
      <DialogContent className={"w-[auto] max-h-[96vh] max-w-[96vw]"}>
        <PrivateImage
          className={"h-[auto] max-h-[88vh] max-w-[88vw] m-auto"}
          taskId={props.taskId}
          token={props.taskToken as string}
          alt={"-"}
        />
      </DialogContent>
    </Dialog>
  )
}
