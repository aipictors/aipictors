import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Dices, HelpCircle } from "lucide-react"

type Props = {
  value: number
  onChange(value: number): void
}

export const GenerationEditorConfigSeed = (props: Props) => {
  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex gap-x-2">
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
      <div className="flex gap-x-2">
        <Input
          type="number"
          value={props.value}
          className="flex-1"
          onChange={(event) => {
            props.onChange(Number(event.target.value))
          }}
        />
        <div className="flex space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size={"icon"}
                  variant={props.value === -1 ? "default" : "secondary"}
                  disabled={props.value === -1}
                  onClick={() => {
                    props.onChange(-1)
                  }}
                >
                  <Dices />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{"Seed値をランダムにする"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {/* <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size={"icon"} variant={"secondary"}>
                  <RefreshCcw />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{"前回生成に使用したSeed値を復元する"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider> */}
        </div>
      </div>
    </div>
  )
}
