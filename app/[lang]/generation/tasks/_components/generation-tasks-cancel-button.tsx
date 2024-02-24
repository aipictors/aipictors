import { Button } from "@/components/ui/button"

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
        className="h-11 rounded-md w-24 ml-2 px-8"
        variant={"destructive"}
        onClick={props.onCancel}
      >
        キャンセル
      </Button>
    </>
  )
}
