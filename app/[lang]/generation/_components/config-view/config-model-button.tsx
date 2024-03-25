import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type Props = {
  imageURL: string
  name: string
  type?: string
  isSelected: boolean
  isDisabled?: boolean
  onClick(): void
}

export const ConfigModelButton = (props: Props) => {
  return (
    <Button
      disabled={props.isDisabled}
      variant={props.isSelected ? "default" : "secondary"}
      className="h-auto w-full overflow-y-hidden p-2"
      onClick={props.onClick}
    >
      <div className="flex w-full space-x-2">
        <img
          src={props.imageURL ?? ""}
          alt={props.name}
          className="w-full max-w-16 rounded object-cover"
          draggable={false}
        />
        <div>
          <p className="whitespace-pre-wrap break-all text-left font-bold text-sm">
            {props.name}
          </p>
          {props.type && (
            <Badge className="mt-4 grid w-16 text-xs opacity-50">
              {props.type}
            </Badge>
          )}
        </div>
      </div>
    </Button>
  )
}
