import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip"
import { DicesIcon, HelpCircleIcon } from "lucide-react"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  value: number
  onChange(value: number): void
}

export function GenerationConfigSeed(props: Props) {
  const t = useTranslation()

  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex gap-x-2">
        <span className="font-bold text-sm">{"Seed"}</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircleIcon className="w-4" />
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {t(
                  "キャラや構図などを固定したいときに使用します。-1にするとランダムになります。",
                  "Use this when you want to lock characters or composition. Set to -1 for random.",
                )}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="flex gap-x-2">
        <Input
          type="number"
          value={props.value}
          className="flex-1"
          onChange={(event) => {
            props.onChange(Number(event.target.value))
          }}
        />
        <div className="flex space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size={"icon"}
                  variant={props.value === -1 ? "default" : "secondary"}
                  disabled={props.value === -1}
                  onClick={() => {
                    props.onChange(-1)
                  }}
                >
                  <DicesIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t("Seed値をランダムにする", "Randomize Seed value")}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {/* <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size={"icon"} variant={"secondary"}>
                  <RefreshCcw />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{"前回生成に使用したSeed値を復元する"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider> */}
        </div>
      </div>
    </div>
  )
}
