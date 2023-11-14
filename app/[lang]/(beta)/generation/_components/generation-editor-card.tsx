"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { HelpCircle } from "lucide-react"

type Props = {
  title: string
  tooltip?: string
  action?: React.ReactNode
  children: React.ReactNode
}

export const GenerationEditorCard = (props: Props) => {
  return (
    <Card className="h-full overflow-x-hidden overflow-y-auto position-relative">
      <div className="flex sticky top-0 z-8 bg-opacity-10 bg-white px-2 py-2 justify-between">
        <div className="flex items-center">
          <p className="fontWeight-bold">{props.title}</p>
        </div>
        <div>
          {props.tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="size-sm border-radius-full"
                    variant={"ghost"}
                  >
                    <HelpCircle />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="font-size-md whitespace-pre-wrap ">
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
