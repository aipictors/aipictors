import { CroppedWorkSquare } from "@/_components/cropped-work-square"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/_components/ui/tooltip"
import type { workQuery } from "@/_graphql/queries/work/work"
import { WorkAdSense } from "@/routes/($lang)._main.works.$work/_components/work-adcense"
import type { ResultOf } from "gql.tada"
import { HelpCircleIcon } from "lucide-react"

type Props = {
  work: ResultOf<typeof workQuery>["work"]
}

export const WorkNextAndPrevious = (props: Props) => {
  if (props.work === null) return null

  if (typeof document !== "undefined") {
    document.addEventListener("keydown", (e: KeyboardEvent) =>
      keyDownHandler(e, props.work),
    )
  }

  return (
    <div className="invisible flex flex-col space-y-8 lg:visible">
      <div>
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
        <div className="flex justify-center space-x-2">
          {props.work.nextWork && (
            <CroppedWorkSquare
              workId={props.work.nextWork.id}
              imageUrl={props.work.nextWork.smallThumbnailImageURL}
              imageWidth={props.work.nextWork.smallThumbnailImageWidth}
              imageHeight={props.work.nextWork.smallThumbnailImageHeight}
              thumbnailImagePosition={
                props.work.nextWork.thumbnailImagePosition ?? 0
              }
              size={"sm"}
            />
          )}
          <div className="opacity-50">
            <CroppedWorkSquare
              workId={props.work.id}
              imageUrl={props.work.smallThumbnailImageURL}
              imageWidth={props.work.smallThumbnailImageWidth}
              imageHeight={props.work.smallThumbnailImageHeight}
              thumbnailImagePosition={props.work.thumbnailImagePosition ?? 0}
              size={"sm"}
            />
          </div>
          {props.work.previousWork && (
            <CroppedWorkSquare
              workId={props.work.previousWork.id}
              imageUrl={props.work.previousWork.smallThumbnailImageURL}
              imageWidth={props.work.previousWork.smallThumbnailImageWidth}
              imageHeight={props.work.previousWork.smallThumbnailImageHeight}
              thumbnailImagePosition={
                props.work.previousWork.thumbnailImagePosition ?? 0
              }
              size={"sm"}
            />
          )}
        </div>
      </div>
      <WorkAdSense />
    </div>
  )
}

function keyDownHandler(
  e: KeyboardEvent,
  work: ResultOf<typeof workQuery>["work"],
): void {
  if (typeof window !== "undefined" && work !== null) {
    if (e.code === "KeyQ" && work.nextWork) {
      window.location.href = `/works/${work.nextWork.id}`
    }
    if (e.code === "KeyE" && work.previousWork) {
      window.location.href = `/works/${work.previousWork.id}`
    }
  }
}
