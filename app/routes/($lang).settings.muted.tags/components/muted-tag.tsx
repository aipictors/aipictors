import { Button } from "~/components/ui/button"

type Props = {
  name: string
  onClick(): void
}

export function MutedTag (props: Props) {
  return (
    <div className="flex justify-between">
      <div>
        <p>{props.name}</p>
      </div>
      <Button className="p-4" onClick={props.onClick}>
        {"解除"}
      </Button>
    </div>
  )
}
