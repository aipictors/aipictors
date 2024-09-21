import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip"
import { config } from "~/config"
import { HelpCircleIcon } from "lucide-react"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  value: string
  onChange(value: string | null): void
}

/**
 * VAEの設定
 */
export function GenerationConfigVae(props: Props) {
  const t = useTranslation()

  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex gap-x-2">
        <span className="font-bold text-sm">{"VAE"}</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircleIcon className="w-4" />
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {t(
                  "出力される色や線を調整します。",
                  "Adjusts the output colors and lines.",
                )}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Select
        value={props.value}
        onValueChange={(value) => {
          value === "" ? props.onChange("ClearVAE_V2.3") : props.onChange(value)
        }}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {config.generationFeature.vaeValues.map((value) => (
            <SelectItem key={value} value={value}>
              {value}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
