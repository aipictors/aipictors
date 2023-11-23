import { Button } from "@/components/ui/button"

type Props = {
  onSelect(): void
  name: string
  imageURL: string | null
  isActive: boolean
}

export const ImageModelCard = (props: Props) => {
  return (
    <div className="stack flex flex-col gap-y-2">
      <Button
        className="p-0 h-auto overflow-hidden border-2 border-gray-200"
        variant={"outline"}
        // borderColor={props.isActive ? "primary.500" : "gray.200"}
        onClick={() => {
          props.onSelect()
        }}
      >
        <img src={props.imageURL ?? ""} alt={props.name} />
      </Button>
      <span className="text-sm font-bold break-words">{props.name}</span>
    </div>
  )
}
