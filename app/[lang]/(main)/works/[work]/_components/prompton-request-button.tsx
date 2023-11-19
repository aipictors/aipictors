import { Button, ButtonProps } from "@/components/ui/button"

type Props = ButtonProps

export const PromptonRequestButton = (props: Props) => {
  return (
    <Button variant={"destructive"} {...props}>
      {"支援"}
    </Button>
  )
}
