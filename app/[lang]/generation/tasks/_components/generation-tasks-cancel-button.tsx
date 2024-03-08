import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"

type Props = {
  onCancel(): void
  isDisabled?: boolean
  isCanceling?: boolean
}

/**
 * 生成キャンセルボタン
 * @returns
 */
export const GenerationTasksCancelButton = (props: Props) => {
  return (
    <>
      <Button
        disabled={props.isDisabled}
        className="ml-2 h-11 w-16"
        variant={"destructive"}
        size={"icon"}
        onClick={props.onCancel}
      >
        <XIcon className="w-4" />
      </Button>
    </>
  )
}
