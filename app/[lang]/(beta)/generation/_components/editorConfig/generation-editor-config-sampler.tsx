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

export const GenerationEditorConfigSampler = () => {
  return (
    <div>
      <div className="flex">
        <span className="font-bold">{"Sampler"}</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle />
            </TooltipTrigger>
            <TooltipContent>
              <p>{"ノイズの除去の手法です。"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Select defaultValue={"SelectItem12"}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="SelectItem1">{"Euler a"}</SelectItem>
          <SelectItem value="SelectItem2">{"Euler"}</SelectItem>
          <SelectItem value="SelectItem3">{"Heun"}</SelectItem>
          <SelectItem value="SelectItem4">{"DPM2"}</SelectItem>
          <SelectItem value="SelectItem5">{"DPM2 a"}</SelectItem>
          <SelectItem value="SelectItem6">{"DPM++ 2S a"}</SelectItem>
          <SelectItem value="SelectItem7">{"DPM++ 2M"}</SelectItem>
          <SelectItem value="SelectItem8">{"LMS Karras"}</SelectItem>
          <SelectItem value="SelectItem9">{"DPM2 a Karras"}</SelectItem>
          <SelectItem value="SelectItem10">{"DPM++ 2S a Karras"}</SelectItem>
          <SelectItem value="SelectItem11">{"DPM++ SDE Karras"}</SelectItem>
          <SelectItem value="SelectItem12">{"DPM++ 2M Karras"}</SelectItem>
          <SelectItem value="SelectItem13">{"DPM++ 2M SDE Karras"}</SelectItem>
          <SelectItem value="SelectItem14">{"DDIM"}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
