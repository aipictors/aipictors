import { cn } from "@/lib/utils"

type Props = {
  displayName: string | null
  description?: string | null
  thumbnailImageURL: string | null
  isActive: boolean
  onSelect(): void
}

export const ImageModelCard = (props: Props) => {
  return (
    <div className="relative">
      <img
        className={cn(
          "h-auto rounded cursor-pointer transition duration-300",
          props.isActive
            ? "ring shadow-lg transform-gpu scale-105 z-10"
            : "hover:shadow-md",
        )}
        src={props.thumbnailImageURL ?? ""}
        alt={props.displayName ?? ""}
        onClick={props.onSelect}
        style={{ transformOrigin: "center" }}
      />
      <div className="flex flex-col space-y-1">
        <span className="text-sm font-bold break-words whitespace-pre-wrap">
          {props.displayName ?? ""}
        </span>
        {props.description && (
          <span className="text-sm break-words whitespace-pre-wrap">
            {props.description}
          </span>
        )}
      </div>
    </div>
  )
}
