import { Button } from "@/components/ui/button"
import { Loader2Icon } from "lucide-react"

type Props = {
  isLoading: boolean
  isDisabled: boolean
  isScheduleMode: boolean
  generatingCount: number
  maxGeneratingCount: number
  onClick(): void
}

export function GenerationSubmitButton(props: Props) {
  const text = props.isScheduleMode ? "予約生成" : "生成"

  const countText = `${props.generatingCount}/${props.maxGeneratingCount}`

  return (
    <Button
      onClick={props.onClick}
      className="w-full"
      disabled={props.isLoading || props.isDisabled}
    >
      <div className="flex items-center">
        {props.isLoading ? "処理中.." : `${text}する (${countText})`}
        {props.generatingCount !== 0 && (
          <Loader2Icon className={"ml-2 w-4 animate-spin dark:black"} />
        )}
      </div>
    </Button>
  )
}
