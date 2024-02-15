import { Button } from "@/components/ui/button"

type Props = {
  isLoading: boolean
  isDisabled: boolean
  onClick(): void
}

export function GenerationCancelButton(props: Props) {
  return (
    <Button
      variant={"destructive"}
      onClick={props.onClick}
      className="w-full"
      size={"lg"}
      disabled={props.isLoading || props.isDisabled}
    >
      {"キャンセルする"}
    </Button>
  )
}
