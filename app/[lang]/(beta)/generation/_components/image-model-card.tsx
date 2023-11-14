import { Button } from "@/components/ui/button"

type Props = {
  onSelect(): void
  name: string
  imageURL: string | null
  isActive: boolean
}

export const ImageModelCard = (props: Props) => {
  return (
    <div className="stack flex">
      <div className="stack flex">
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
        <p className="text-sm">{props.name}</p>
      </div>
    </div>
  )
}
