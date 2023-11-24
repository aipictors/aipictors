import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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
          <img
            className="rounded"
            src={props.imageURL ?? ""}
            alt={props.name}
          />
        </Button>
        <div className="flex flex-col space-y-1">
          <span className="text-sm break-words whitespace-pre-wrap font-bold">
            {props.name}
          </span>
          <span className="text-sm break-words whitespace-pre-wrap">
            {props.description}
          </span>
        </div>
      </div>
    </div>
  )
}
