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
import { cn } from "~/lib/utils"
import { HomeCoppedWorkFragment } from "~/routes/($lang)._main._index/components/home-cropped-work-list-with-scroll"
import { HomeCroppedWorkList } from "~/routes/($lang)._main._index/components/home-cropped-work-list"
import { useTranslation } from "~/hooks/use-translation"
import type { HomePromotionWorkFragment } from "~/routes/($lang)._main._index/components/home-works-users-recommended-section"

type Props = {
  works: FragmentOf<typeof HomePromotionWorkFragment>[]
  title?: string
  tooltip?: string
  link?: string
  isCropped?: boolean
  targetRowHeight?: number
  isShowProfile?: boolean
}

export function HomeRecommendedWorkList (props: Props) {
  const t = useTranslation()

  if (props.works.length === 0) {
    return null
  }

  return (
    <section className={cn(props.title ? "space-y-4" : "gap-y-4")}>
      <div className="flex items-center justify-between">
        <h2 className="items-center space-x-2 font-bold text-md">
          <p className="text-left font-bold text-xl">
            {props.title && props.title}
          </p>
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
              {t("すべて見る", "All")}
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
          isShowProfile={props.isShowProfile}
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
