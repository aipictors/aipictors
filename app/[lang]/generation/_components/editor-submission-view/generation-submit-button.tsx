import { Button } from "@/components/ui/button"
import { Loader2Icon } from "lucide-react"

type Props = {
  isLoading: boolean
  isDisabled: boolean
  generatingCount: number
  maxGeneratingCount: number
  onClick(): void
}

export function GenerationSubmitButton(props: Props) {
  return (
    <Button
      onClick={props.onClick}
      className="w-full"
      size={"lg"}
      disabled={props.isDisabled}
    >
      {`生成する(${props.generatingCount}/${props.maxGeneratingCount})`}
      {props.isLoading && <Loader2Icon className="ml-2 h-4 w-4 animate-spin" />}
    </Button>
  )
}
