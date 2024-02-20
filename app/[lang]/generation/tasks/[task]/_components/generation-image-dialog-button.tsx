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
  return (
    <Dialog>
      <DialogTrigger
        className={
          props.isAbsolute === true
            ? "absolute hover:opacity-80 rounded-full right-2 bottom-2"
            : ""
        }
      >
        <span>{props.children}</span>
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
