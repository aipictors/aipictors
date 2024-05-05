import { PrivateImage } from "@/_components/private-image"
import { Dialog, DialogContent, DialogTrigger } from "@/_components/ui/dialog"
import { GenerationTaskContentImagePlaceHolder } from "@/routes/($lang).generation._index/_components/generation-task-content-image-place-holder"
import { Suspense } from "react"

type Props = {
  taskId: string
  children: React.ReactNode
  isAbsolute?: boolean
  fileName: string
  thumbnailFileName: string
  userToken: string
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
              className={"m-auto max-h-96 w-72 max-w-['50vw']"}
            />
          }
        >
          {props.userToken && (
            <PrivateImage
              className={"m-auto h-[auto] max-h-[88vh] max-w-[88vw]"}
              taskId={props.taskId}
              token={props.userToken}
              isThumbnail={false}
              alt={"-"}
              fileName={props.fileName}
              thumbnailFileName={props.thumbnailFileName}
            />
          )}
        </Suspense>
      </DialogContent>
    </Dialog>
  )
}
