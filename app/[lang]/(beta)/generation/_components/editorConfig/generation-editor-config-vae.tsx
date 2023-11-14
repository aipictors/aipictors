import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { HelpCircle } from "lucide-react"

/**
 * VAEの設定
 * @returns
 */
export const GenerationEditorConfigVae = () => {
  return (
    <div>
      <div className="flex space-x-2">
        <span className="font-bold">{"VAE"}</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle />
            </TooltipTrigger>
            <TooltipContent>
              <p>{"出力される色や線を調整します。"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Select defaultValue={"option3"}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">{"なし"}</SelectItem>
          <SelectItem value="option2">{"kl-f8-anime2"}</SelectItem>
          <SelectItem value="option3">{"ClearVAE_V2.3"}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
