import { Button } from "@/components/ui/button"

type Props = {
  imageURL: string
  name: string
  isSelected: boolean
  onClick(): void
}

export const SelectableModel = (props: Props) => {
  // props.isSelected
  return (
    <Button
      className="w-full p-2 h-auto overflow-hidden"
      onClick={props.onClick}
    >
      <div className="flex space-x-4 w-full">
        <img
          src={props.imageURL ?? ""}
          alt={props.name}
          className="rounded-md w-full max-w-[4rem] object-cover"
          draggable={false}
        />
        <p className="break-all text-sm font-bold whitespace-pre-wrap">
          {props.name}
        </p>
      </div>
    </Button>
  )
}
