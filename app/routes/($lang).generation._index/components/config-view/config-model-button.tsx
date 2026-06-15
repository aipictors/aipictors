import { SearchIcon } from "lucide-react"
import { Badge } from "~/components/ui/badge"
import { CoinIcon } from "~/components/coin-icon"
import { Button } from "~/components/ui/button"
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
  const isNoQueueModel =
    props.type === "FLUX" ||
    props.type === "SD5" ||
    props.name?.toLowerCase().includes("gemini")

  const getCoinCost = () => {
    if (props.name === "Gemini 2.5" || props.name === "GeminiNanoBanana") {
      return 50
    }

    if (props.name === "Gemini 3.1" || props.name === "GeminiNanoBanana2") {
      return 100
    }

    return 10
  }

  const coinCost = getCoinCost()

  return (
    <div className="relative">
      <Button
        disabled={props.isDisabled}
        variant={props.isSelected ? "default" : "secondary"}
        className={
          "h-auto w-full overflow-y-hidden p-2 " +
          (props.isSelected
            ? "bg-zinc-300 text-black hover:bg-zinc-300 dark:bg-zinc-700 dark:text-white dark:hover:bg-zinc-700"
            : "")
        }
        onClick={props.onClick}
      >
        <div className="flex w-full items-start space-x-2">
          <img
            src={props.imageURL ?? ""}
            alt={props.name}
            className="w-full max-w-16 rounded object-cover"
            draggable={false}
          />
          <div className="flex min-w-0 flex-1 flex-col">
            <p className="whitespace-pre-wrap break-all text-left font-bold text-sm">
              {props.name}
            </p>
            {props.type && (
              <div className="flex flex-col space-y-2">
                <div className="mt-4 flex items-center space-x-2">
                  <Badge className="grid w-16 text-xs opacity-50">
                    {props.type}
                  </Badge>
                  <Badge className="gap-1 text-xs opacity-80">
                    <span>{t("消費:", "Cost:")}</span>
                    <CoinIcon className="h-4 w-4 shrink-0" />
                    <span>{coinCost}</span>
                    <span>{t("コイン", "coins")}</span>
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
                      {t("超高速生成", "super fast generation")}
                    </Badge>
                  )}
                  {props.name === "flux.1 pro" && (
                    <Badge className="text-xs opacity-50">
                      {t("高速生成", "super fast generation")}
                    </Badge>
                  )}
                  {(props.name === "Gemini 2.5" ||
                    props.name === "GeminiNanoBanana" ||
                    props.name === "Gemini 3.1" ||
                    props.name === "GeminiNanoBanana2") && (
                    <Badge className="text-xs opacity-50" variant={"destructive"}>
                      {t("LITE以上限定", "LITE or above only")}
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
                  {isNoQueueModel && (
                    <Badge className="text-xs" variant={"outline"}>
                      {t("待ち人数なし", "No queue")}
                    </Badge>
                  )}
                </div>
                {isNoQueueModel && (
                  <p className="text-left text-muted-foreground text-xs">
                    {t(
                      "Gemini/Fluxは待ち人数なしで開始されます",
                      "Gemini/Flux starts without queue wait",
                    )}
                  </p>
                )}
                <p className="flex items-center gap-1 text-left font-semibold text-sky-600 text-xs dark:text-sky-400">
                  <span>{t("消費:", "Cost:")}</span>
                  <CoinIcon className="h-4 w-4 shrink-0" />
                  <span>{coinCost}</span>
                  <span>{t("コイン", "coins")}</span>
                </p>
                {(props.name === "Gemini 2.5" ||
                  props.name === "GeminiNanoBanana" ||
                  props.name === "Gemini 3.1" ||
                  props.name === "GeminiNanoBanana2") && (
                  <p className="text-left text-amber-600 text-xs dark:text-amber-400">
                    {t(
                      "Nano Banana / Nano Banana 2 はLite以上限定です（Liteは1日3回まで）",
                      "Nano Banana / Nano Banana 2 require Lite or above (Lite: 3/day)",
                    )}
                  </p>
                )}
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
