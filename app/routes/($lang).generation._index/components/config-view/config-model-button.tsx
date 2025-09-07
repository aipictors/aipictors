import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { SearchIcon } from "lucide-react"
import { useTranslation } from "~/hooks/use-translation"

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

export function ConfigModelButton(props: Props) {
  const t = useTranslation()

  return (
    <div className="relative">
      <Button
        disabled={props.isDisabled}
        variant={props.isSelected ? "default" : "secondary"}
        className={
          // biome-ignore lint/style/useTemplate: concatenation needed for conditional styling
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
              <div className="flex flex-col space-y-2">
                <div className="mt-4 flex items-center space-x-2">
                  <Badge className="grid w-16 text-xs opacity-50">
                    {props.type}
                  </Badge>
                  {props.type === "FLUX" && (
                    <Badge className="text-xs opacity-50">
                      {t("STANDARD以上", "super fast generation")}
                    </Badge>
                  )}
                </div>
                <div className="flex space-x-2">
                  {props.name === "flux.1 schnell" && (
                    <Badge className="text-xs opacity-50">
                      {t("10枚分消費", "cost of 10")}
                    </Badge>
                  )}
                  {props.name === "flux.1 schnell" && (
                    <Badge className="text-xs opacity-50">
                      {t("超高速生成", "super fast generation")}
                    </Badge>
                  )}
                  {props.name === "flux.1 pro" && (
                    <Badge className="text-xs opacity-50">
                      {t("30枚分消費", "cost of 30")}
                    </Badge>
                  )}
                  {props.name === "flux.1 pro" && (
                    <Badge className="text-xs opacity-50">
                      {t("高速生成", "super fast generation")}
                    </Badge>
                  )}
                  {props.name === "Gemini 2.5" && (
                    <Badge className="text-xs opacity-50">
                      {t("5枚分消費", "cost of 5")}
                    </Badge>
                  )}
                  {(props.name?.toLowerCase().includes("gemini") ||
                    props.type === "SD5") && (
                    <Badge
                      className="text-xs opacity-50"
                      variant={"destructive"}
                    >
                      {props.type || "GEMINI"}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </Button>
      {!props.isHideSearchButton && (
        <Button
          disabled={props.isDisabled}
          onClick={props.onSearchClick}
          className="absolute top-1 right-1 size-8 rounded-full border-2"
          size={"icon"}
          variant={"secondary"}
        >
          <SearchIcon className="w-4" />
        </Button>
      )}
    </div>
  )
}
