"use client"

import { Card } from "@/components/ui/card"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { config } from "@/config"
import { HelpCircleIcon } from "lucide-react"
import Link from "next/link"
import { useMediaQuery } from "usehooks-ts"

type Props = {
  title: string
  tooltip?: string
  tooltipDetailLink?: string
  action?: React.ReactNode
  children: React.ReactNode
}

export const GenerationViewCard = (props: Props) => {
  const isDesktop = useMediaQuery(config.mediaQuery.isDesktop)

  return (
    <Card className="h-full flex flex-col w-full max-w-none overflow-hidden">
      <div className="flex px-4 pt-2 pb-2 justify-between">
        <div className="flex items-center">
          <span className="font-bold">{props.title}</span>
        </div>
        <div className="flex items-center space-x-2">
          {props.tooltip &&
            (isDesktop ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircleIcon className="w-4" />
                  </TooltipTrigger>
                  <TooltipContent className="font-size-md whitespace-pre-wrap">
                    {props.tooltip}
                    {props.tooltipDetailLink && (
                      <Link href={props.tooltipDetailLink}>{"(詳細)"}</Link>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <Popover>
                <PopoverTrigger asChild>
                  <HelpCircleIcon className="w-4" />
                </PopoverTrigger>
                <PopoverContent className="font-size-md whitespace-pre-wrap">
                  {props.tooltip}
                  {props.tooltipDetailLink && (
                    <Link href={props.tooltipDetailLink}>{"(詳細)"}</Link>
                  )}
                </PopoverContent>
              </Popover>
            ))}
        </div>
      </div>
      {props.children}
    </Card>
  )
}
