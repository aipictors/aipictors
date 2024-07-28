import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import { GenerationTaskContentImagePlaceHolder } from "~/routes/($lang).generation._index/components/generation-task-content-image-place-holder"
import { Suspense } from "react"

type Props = {
  imageUrl: string
  children: React.ReactNode
  isAbsolute?: boolean
}

/**
 * 生成作品のダイアログのボタン
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
              className={"m-auto max-h-96 w-72 max-w-['50vw']"}
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
