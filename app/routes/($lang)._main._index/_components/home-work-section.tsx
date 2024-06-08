import { ResponsivePhotoWorksAlbum } from "@/_components/responsive-photo-works-album"
import { Button } from "@/_components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/_components/ui/tooltip"
import type { WorksQuery } from "@/_graphql/__generated__/graphql"
import { RiQuestionLine } from "@remixicon/react"

type Props = {
  works: NonNullable<WorksQuery["works"]> | null
  title: string
  tooltip?: string
  link?: string
}

export const HomeWorkSection = (props: Props) => {
  if (props.works === null || props.works.length === 0) {
    return null
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="items-center space-x-2 font-bold text-md">
          {props.title}
          {props.tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <RiQuestionLine className="inline h-6 w-auto" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{props.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </h2>
        {props.link && (
          <a href={props.link}>
            <Button variant={"secondary"} size={"sm"}>
              {"すべて見る"}
            </Button>
          </a>
        )}
      </div>
      <ResponsivePhotoWorksAlbum works={props.works} />
    </section>
  )
}
