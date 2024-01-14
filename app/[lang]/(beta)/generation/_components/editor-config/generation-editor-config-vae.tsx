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
import { Config } from "@/config"
import { HelpCircleIcon } from "lucide-react"

type Props = {
  value: string | null
  onChange(value: string | null): void
}

/**
 * VAEの設定
 * @returns
 */
export const GenerationEditorConfigVae = (props: Props) => {
  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex gap-x-2">
        <span className="font-bold">{"VAE"}</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircleIcon />
            </TooltipTrigger>
            <TooltipContent>
              <p>{"出力される色や線を調整します。"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Select
        value={props.value ?? ""}
        onValueChange={(value) => {
          props.onChange(value)
        }}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="null">{"なし"}</SelectItem>
          {Config.generation.vaeValues.map((value) => (
            <SelectItem key={value} value={value}>
              {value}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
