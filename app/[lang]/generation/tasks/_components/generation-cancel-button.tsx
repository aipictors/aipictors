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
        <Loader2 className="mt-4 mr-4 ml-auto h-6 w-6 animate-spin" />
      ) : (
        <Button
          className="absolute right-2 mt-2 mr-2 ml-auto"
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
