import { Button } from "@/components/ui/button"

type Props = {
  name: string
}

export const TagButton = (props: Props) => {
  return (
    <Button size={"sm"} variant={"outline"}>
      {props.name}
    </Button>
  )
}
