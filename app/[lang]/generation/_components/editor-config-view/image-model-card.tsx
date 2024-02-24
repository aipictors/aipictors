import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type Props = {
  displayName: string | null
  description?: string | null
  type?: string | null
  thumbnailImageURL: string | null
  isActive: boolean
  onSelect(): void
}

export const ImageModelCard = (props: Props) => {
  return (
    <Card
      className={cn(
        "flex relative cursor-pointer flex-col h-full",
        "hover:bg-accent hover:text-accent-foreground",
        { "border-primary": props.isActive },
      )}
      onClick={props.onSelect}
      onKeyUp={() => {}}
    >
      <img
        className={"w-full rounded-lg"}
        src={props.thumbnailImageURL ?? ""}
        alt={props.displayName ?? ""}
        style={{ transformOrigin: "center" }}
      />
      <div className="p-2">
        <span className="text-sm font-bold break-words whitespace-pre-wrap">
          {props.displayName ?? ""}
        </span>
        {props.type && (
          <span className="absolute text-white top-2 left-2 bg-black bg-opacity-50 rounded-lg py-2 px-4">
            {props.type}
          </span>
        )}
        {props.description && (
          <span className="text-sm break-words whitespace-pre-wrap">
            {props.description}
          </span>
        )}
      </div>
    </Card>
  )
}
