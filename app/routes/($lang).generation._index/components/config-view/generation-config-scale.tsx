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

export function GenerationConfigScale (props: Props) {
  const t = useTranslation()

  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex items-center gap-x-2">
        <span className="font-bold text-sm">{"Scale"}</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircleIcon className="w-4" />
            </TooltipTrigger>
            <TooltipContent>
              {t(
                "Scale値が小さいほど創造的な画像を生成できます。値が大きいほど、より厳密にテキストを解釈します。",
                "A lower Scale value produces more creative images, while a higher value interprets the text more strictly.",
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Input
        type="number"
        value={props.value}
        min={6}
        max={15}
        onChange={(event) => {
          props.onChange(Number(event.target.value))
        }}
      />
    </div>
  )
}
