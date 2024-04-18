import { useGenerationContext } from "@/[lang]/generation/_hooks/use-generation-context"
import { Dialog, DialogContent, DialogTrigger } from "@/_components/ui/dialog"
import { GenerationTaskContentImagePlaceHolder } from "@/routes/($lang).generation.tasks.$task/_components/generation-task-content-image-place-holder"
import { Suspense } from "react"

type Props = {
  imageUrl: string
  children: React.ReactNode
  isAbsolute?: boolean
}

/**
 * 生成作品のダイアログのボタン
 * @param props
 * @returns
 */
export function GenerationWorkDialogButton(props: Props) {
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
          <img
            className={"m-auto h-[auto] max-h-[88vh] max-w-[88vw]"}
            src={props.imageUrl}
            alt={"作品プレビュー"}
          />
        </Suspense>
      </DialogContent>
    </Dialog>
  )
}
