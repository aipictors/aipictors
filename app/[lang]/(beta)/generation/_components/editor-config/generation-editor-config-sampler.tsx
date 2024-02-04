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
import { config } from "@/config"
import { HelpCircleIcon } from "lucide-react"

type Props = {
  value: string
  onChange(value: string): void
}

export const GenerationEditorConfigSampler = (props: Props) => {
  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex gap-x-2">
        <span className="font-bold text-sm">{"Sampler"}</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircleIcon className="w-4" />
            </TooltipTrigger>
            <TooltipContent>
              <p>{"ノイズの除去の手法です。"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Select
        value={props.value}
        onValueChange={(value) => {
          props.onChange(value)
        }}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {config.generationFeature.samplerValues.map((sampler) => (
            <SelectItem key={sampler} value={sampler}>
              {sampler}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
