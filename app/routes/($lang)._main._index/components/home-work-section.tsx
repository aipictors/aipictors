import { ResponsivePhotoWorksAlbum } from "~/components/responsive-photo-works-album"
import { Button } from "~/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip"
import type { partialWorkFieldsFragment } from "~/graphql/fragments/partial-work-fields"
import { HomeCroppedWorkList } from "~/routes/($lang)._main._index/components/home-cropped-work-list"
import { Link } from "@remix-run/react"
import { RiQuestionLine } from "@remixicon/react"
import type { FragmentOf } from "gql.tada"

type Props = {
  works: FragmentOf<typeof partialWorkFieldsFragment>[]
  title: string
  tooltip?: string
  link?: string
  isCropped?: boolean
  targetRowHeight?: number
}

export const HomeWorkSection = (props: Props) => {
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
          <Link to={props.link}>
            <Button variant={"secondary"} size={"sm"}>
              {"すべて見る"}
            </Button>
          </Link>
        )}
      </div>
      {props.isCropped ? (
        <HomeCroppedWorkList works={props.works} />
      ) : (
        <ResponsivePhotoWorksAlbum
          works={props.works}
          targetRowHeight={props.targetRowHeight}
        />
      )}
    </section>
  )
}
