import { Input } from "@/components/ui/input"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { HelpCircleIcon } from "lucide-react"

type Props = {
  value: number
  onChange(value: number): void
}

export const GenerationEditorConfigScale = (props: Props) => {
  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex gap-x-2">
        <span className="font-bold">{"Scale"}</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircleIcon />
            </TooltipTrigger>
            <TooltipContent>
              {
                "Scale値が小さいほど創造的な画像を生成できます。値が大きいほど、より厳密にテキストを解釈します。"
              }
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Input
        type="number"
        value={props.value}
        min={1}
        max={15}
        onChange={(event) => {
          props.onChange(Number(event.target.value))
        }}
      />
    </div>
  )
}
