"use client"
import { SmallSquareThumbnail } from "@/app/[lang]/(main)/works/[work]/_components/small-square-thumbnail"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { WorkQuery } from "@/graphql/__generated__/graphql"
import { HelpCircleIcon } from "lucide-react"

type Props = {
  work: WorkQuery["work"]
}

export const WorkNextAndPrevious = (props: Props) => {
  if (props.work === null) return null

  if (typeof document !== "undefined") {
    document.addEventListener("keydown", (e: KeyboardEvent) =>
      keyDownHandler(e, props.work),
    )
  }

  return (
    <div className="invisible lg:visible">
      <div className="flex py-2 text-md">
        <h2>{"前後の作品"}</h2>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircleIcon className="ml-1 w-4" />
            </TooltipTrigger>
            <TooltipContent>
              <p>{"[Q][E]キーで移動することもできます"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="mb-4 flex">
        <SmallSquareThumbnail work={props.work.nextWork} linkToWork={true} />
        <SmallSquareThumbnail work={props.work} isFocus={true} />
        <SmallSquareThumbnail
          work={props.work.previousWork}
          linkToWork={true}
        />
      </div>
    </div>
  )
}

function keyDownHandler(e: KeyboardEvent, work: WorkQuery["work"]): void {
  if (typeof window !== "undefined" && work !== null) {
    if (e.code === "KeyQ" && work.nextWork) {
      window.location.href = `/works/${work.nextWork.id}`
    }
    if (e.code === "KeyE" && work.previousWork) {
      window.location.href = `/works/${work.previousWork.id}`
    }
  }
}

export default WorkNextAndPrevious
