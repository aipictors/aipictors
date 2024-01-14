"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { HelpCircleIcon } from "lucide-react"

type Props = {
  title: string
  tooltip?: string
  action?: React.ReactNode
  children: React.ReactNode
}

export const GenerationEditorCard = (props: Props) => {
  return (
    <Card className="h-full flex flex-col w-full overflow-hidden">
      <div className="flex px-2 py-2 justify-between">
        <div className="flex items-center">
          <span className="font-bold">{props.title}</span>
        </div>
        <div className="flex items-center space-x-2">
          {props.tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size={"icon"} variant={"ghost"}>
                    <HelpCircleIcon />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="font-size-md whitespace-pre-wrap">
                  {props.tooltip}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {props.action}
        </div>
      </div>
      {props.children}
    </Card>
  )
}
