import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Props = {
  onSelect(): void
  name: string
  imageURL: string | null
  isActive: boolean
}

export const ImageModelCard = (props: Props) => {
  return (
    <div className="flex flex-col gap-y-2">
      <Button
        className={cn(
          "h-auto overflow-hidden rounded",
          props.isActive ? "p-1" : "p-0",
        )}
        variant={"destructive"}
        onClick={() => {
          props.onSelect()
        }}
      >
        <img src={props.imageURL ?? ""} alt={props.name} />
      </Button>
      <span className="text-sm font-bold break-words whitespace-pre-wrap">
        {props.name}
      </span>
    </div>
  )
}
