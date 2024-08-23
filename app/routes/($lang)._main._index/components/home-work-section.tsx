import {
  PhotoAlbumWorkFragment,
  ResponsivePhotoWorksAlbum,
} from "~/components/responsive-photo-works-album"
import { Button } from "~/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip"
import { Link } from "@remix-run/react"
import { RiQuestionLine } from "@remixicon/react"
import { graphql, type FragmentOf } from "gql.tada"
import { cn } from "~/lib/cn"
import { HomeCoppedWorkFragment } from "~/routes/($lang)._main._index/components/home-cropped-work-list-with-scroll"
import { HomeCroppedWorkList } from "~/routes/($lang)._main._index/components/home-cropped-work-list"

type Props = {
  works: FragmentOf<typeof HomeWorkFragment>[]
  title: string
  tooltip?: string
  link?: string
  isCropped?: boolean
  targetRowHeight?: number
}

export function HomeWorkSection(props: Props) {
  if (props.works.length === 0) {
    return null
  }

  return (
    <section className={cn(props.title ? "space-y-4" : "gap-y-4")}>
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
          // size="large"
          // isHideProfile={true}
        />
      )}
    </section>
  )
}

export const HomeWorkFragment = graphql(
  `fragment HomeWork on WorkNode @_unmask {
    ...PhotoAlbumWork
    ...HomeCoppedWork
  }`,
  [PhotoAlbumWorkFragment, HomeCoppedWorkFragment],
)
