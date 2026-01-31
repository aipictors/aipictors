import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import { GenerationTaskContentImagePlaceHolder } from "~/routes/($lang).generation._index/components/generation-task-content-image-place-holder"
import { Suspense } from "react"
import { normalizeGenerativeFileUrl } from "~/utils/normalize-generative-file-url"

type Props = {
  imageUrl: string
  children: React.ReactNode
  isAbsolute?: boolean
}

/**
 * 生成作品のダイアログのボタン
 */
export function GenerationWorkDialogButton (props: Props) {
  const _context = useGenerationContext()

  const normalizedImageUrl = normalizeGenerativeFileUrl(props.imageUrl)

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
            src={normalizedImageUrl}
            data-generative-raw={props.imageUrl}
            onError={(event) => {
              const img = event.currentTarget
              const raw = img.dataset.generativeRaw
              if (!raw) return
              if (img.dataset.generativeFallback === "true") {
                return
              }
              img.dataset.generativeFallback = "true"
              img.src = raw
            }}
            alt={"作品プレビュー"}
          />
        </Suspense>
      </DialogContent>
    </Dialog>
  )
}
