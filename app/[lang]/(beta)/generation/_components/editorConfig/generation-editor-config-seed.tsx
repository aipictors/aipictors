import { Input } from "@/components/ui/input"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Dices, HelpCircle, RefreshCcw } from "lucide-react"

export const GenerationEditorConfigSeed = () => {
  return (
    <div>
      <div className="flex">
        <span className="font-bold">{"Seed"}</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle />
            </TooltipTrigger>
            <TooltipContent>
              <p>{"キャラや構図などを固定したいときに使用します。"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="flex">
        <Input type="number" defaultValue={-3} className="flex-1" />
        <div className="flex space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Dices />
              </TooltipTrigger>
              <TooltipContent>
                <p>{"Seed値をランダムにする"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <RefreshCcw />
              </TooltipTrigger>
              <TooltipContent>
                <p>{"前回生成に使用したSeed値を復元する"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  )
}
