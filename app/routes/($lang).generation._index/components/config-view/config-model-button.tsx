import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SearchIcon } from "lucide-react"

type Props = {
  imageURL: string
  name: string
  type?: string
  isSelected: boolean
  isDisabled?: boolean
  isHideSearchButton?: boolean
  onClick(): void
  onSearchClick(): void
}

export const ConfigModelButton = (props: Props) => {
  return (
    <div className="relative">
      <Button
        disabled={props.isDisabled}
        variant={props.isSelected ? "default" : "secondary"}
        className={
          // biome-ignore lint/nursery/useSortedClasses: <explanation>
          // biome-ignore lint/style/useTemplate: <explanation>
          "h-auto w-full overflow-y-hidden p-2 " +
          (props.isSelected
            ? "bg-zinc-300 text-black hover:bg-zinc-300 dark:bg-zinc-700 dark:text-white dark:hover:bg-zinc-700"
            : "")
        }
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
      {!props.isHideSearchButton && (
        <Button
          disabled={props.isDisabled}
          onClick={props.onSearchClick}
          className="absolute top-1 right-1 h-8 w-8 rounded-full border-2"
          size={"icon"}
          variant={"secondary"}
        >
          <SearchIcon className="w-4" />
        </Button>
      )}
    </div>
  )
}
