import { Input } from "~/components/ui/input"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip"
import { HelpCircleIcon } from "lucide-react"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  value: number
  onChange(value: number): void
}

/**
 * ClipSkipの設定
 */
export function GenerationConfigClipSkip(props: Props) {
  const t = useTranslation()

  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex gap-x-2">
        <span className="font-bold text-sm">{"ClipSkip"}</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircleIcon className="w-4" />
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {t(
                  "絵柄の雰囲気が変わります",
                  "The style of the image may change",
                )}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Input
        type="number"
        value={props.value}
        min={1}
        max={12}
        onChange={(event) => {
          props.onChange(Number(event.target.value))
        }}
      />
    </div>
  )
}
