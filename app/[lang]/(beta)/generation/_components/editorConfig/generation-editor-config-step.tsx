import { Input } from "@/components/ui/input"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { HelpCircle } from "lucide-react"

export const GenerationEditorConfigStep = () => {
  return (
    <div className="flex flex-col">
      <div className="flex">
        <span className="font-bold">{"Steps"}</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle />
            </TooltipTrigger>
            <TooltipContent>
              <p>{"Steps値を大きくするほどイラストがより洗練されます。"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Input type="number" defaultValue={20} min={9} max={25} />
    </div>
  )
}
