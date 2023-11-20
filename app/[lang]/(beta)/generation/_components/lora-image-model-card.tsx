import { Button } from "@/components/ui/button"

type Props = {
  onSelect(): void
  name: string
  description: string | null
  imageURL: string | null
  isActive: boolean
}

export const LoraImageModelCard = (props: Props) => {
  return (
    <div>
      <div className="flex flex-col">
        <Button
          className="p-0 h-auto overflow-hidden border-width-2 rounded"
          variant={"outline"}
          // borderColor={props.isActive ? "primary.500" : "gray.200"}
          onClick={() => {
            props.onSelect()
          }}
        >
          <img src={props.imageURL ?? ""} alt={props.name} />
        </Button>
        <div className="flex flex-col space-y-0">
          <span className="text-sm">{props.name}</span>
          <span className="text-sm">{props.description}</span>
        </div>
      </div>
    </div>
  )
}
