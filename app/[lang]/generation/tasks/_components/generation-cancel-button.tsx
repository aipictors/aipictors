import { Button } from "@/components/ui/button"
import { Loader2, XIcon } from "lucide-react"

type Props = {
  onCancel?(): void
  isDisabled?: boolean
  isCanceling?: boolean
}

/**
 * 単一生成タスクのキャンセルボタン
 * @returns
 */
export const GenerationTaskCancelButton = (props: Props) => {
  return (
    <>
      {props.isCanceling ? (
        <Loader2 className="ml-auto mr-4 mt-4 h-6 w-6 animate-spin" />
      ) : (
        <Button
          className="ml-auto mr-2 mt-2 absolute right-2"
          size={"icon"}
          variant="ghost"
          disabled={props.isDisabled}
          onClick={props.onCancel}
        >
          <XIcon className="h-6 w-6" />
        </Button>
      )}
    </>
  )
}
