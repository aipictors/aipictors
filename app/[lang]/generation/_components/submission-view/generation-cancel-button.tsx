import { Button } from "@/_components/ui/button"

type Props = {
  isLoading: boolean
  onClick(): void
}

export function GenerationCancelButton(props: Props) {
  return (
    <Button
      variant={"destructive"}
      onClick={props.onClick}
      className="w-full"
      size={"lg"}
      disabled={props.isLoading}
    >
      {props.isLoading ? "キャンセル中.." : "キャンセルする"}
    </Button>
  )
}
