import { Button } from "@/components/ui/button"

type Props = {
  imageURL: string
  name: string
  isSelected: boolean
  onClick(): void
}

export const ConfigModelButton = (props: Props) => {
  return (
    <Button
      variant={props.isSelected ? "default" : "secondary"}
      className="w-full p-2 h-auto overflow-y-hidden"
      onClick={props.onClick}
    >
      <div className="flex space-x-2 w-full">
        <img
          src={props.imageURL ?? ""}
          alt={props.name}
          className="rounded w-full max-w-16 object-cover"
          draggable={false}
        />
        <p className="break-all text-sm font-bold whitespace-pre-wrap text-left">
          {props.name}
        </p>
      </div>
    </Button>
  )
}
