import { Button } from "@/components/ui/button"

type Props = {
  inProgress: boolean
  isLoading: boolean
  isDisabled: boolean
  onClick(): void
}

export function GenerationSubmitButton(props: Props) {
  return (
    <Button
      onClick={props.onClick}
      className="w-full"
      size={"lg"}
      disabled={props.isLoading || props.inProgress || props.isDisabled}
    >
      {props.isLoading || props.inProgress ? "生成中.." : "生成する"}
    </Button>
  )
}
