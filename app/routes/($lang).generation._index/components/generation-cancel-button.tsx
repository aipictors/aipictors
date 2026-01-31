import { Button } from "~/components/ui/button"
import { Loader2, XIcon } from "lucide-react"

type Props = {
  onCancel?(): void
  isDisabled?: boolean
  isCanceling?: boolean
}

/**
 * 単一生成タスクのキャンセルボタン
 */
export function GenerationTaskCancelButton (props: Props) {
  return (
    <>
      {props.isCanceling ? (
        <Loader2 className="mt-4 mr-4 ml-auto size-6 animate-spin" />
      ) : (
        <Button
          className="absolute right-2 z-10 mt-2 mr-2 ml-auto"
          size={"icon"}
          variant="ghost"
          disabled={props.isDisabled}
          onClick={props.onCancel}
        >
          <XIcon className="size-6" />
        </Button>
      )}
    </>
  )
}
