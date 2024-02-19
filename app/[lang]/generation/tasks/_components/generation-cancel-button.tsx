import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"

type Props = {
  onCancel?(): void
  isDisabled?: boolean
}

/**
 * 単一生成タスクのキャンセルボタン
 * @returns
 */
export const GenerationTaskCancelButton = (props: Props) => {
  return (
    <>
      <Button
        className="ml-auto mr-2 mt-2"
        size={"icon"}
        variant="ghost"
        disabled={props.isDisabled}
        onClick={props.onCancel}
      >
        <XIcon className="h-6 w-6" />
      </Button>
    </>
  )
}
