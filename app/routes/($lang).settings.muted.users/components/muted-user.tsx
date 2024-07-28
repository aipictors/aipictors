import { Button } from "@/components/ui/button"

type Props = {
  name: string
  iconImageURL: string | null
  onClick(): void
}

export const MutedUser = (props: Props) => {
  return (
    <div className="flex justify-between">
      <div className="flex items-center">
        <div className="h-8 w-8 overflow-hidden rounded-full">
          <img
            src={props.iconImageURL ?? undefined}
            alt={props.name}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="ml-2">
          <p>{props.name}</p>
        </div>
      </div>
      <Button className="rounded-full px-4 py-2" onClick={props.onClick}>
        {"解除"}
      </Button>
    </div>
  )
}
