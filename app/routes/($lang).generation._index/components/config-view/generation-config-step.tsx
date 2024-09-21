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

export function GenerationConfigStep(props: Props) {
  const t = useTranslation()

  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex gap-x-2">
        <span className="font-bold text-sm">{"Steps"}</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircleIcon className="w-4" />
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {t(
                  "Steps値を大きくするほどイラストがより洗練されます。",
                  "The higher the Steps value, the more refined the illustration becomes.",
                )}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Input
        type="number"
        value={props.value}
        min={9}
        max={25}
        onChange={(event) => {
          props.onChange(Number(event.target.value))
        }}
      />
    </div>
  )
}
