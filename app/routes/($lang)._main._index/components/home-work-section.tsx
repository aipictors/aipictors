import { Link } from "~/lib/app/locale-router"
import { RiQuestionLine } from "@remixicon/react"
import { type FragmentOf, graphql } from "gql.tada"
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
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import { HomeCroppedWorkList } from "~/routes/($lang)._main._index/components/home-cropped-work-list"
import { HomeCoppedWorkFragment } from "~/routes/($lang)._main._index/components/home-cropped-work-list-with-scroll"

type Props = {
  works: FragmentOf<typeof HomeWorkFragment>[]
  title?: string
  tooltip?: string
  link?: string
  isCropped?: boolean
  priorityCount?: number
  targetRowHeight?: number
  isShowProfile?: boolean
  autoPlayVideoPreview?: boolean
  onSelect?: (index: string) => void
  /** 最後の行の半端な作品を隠して行をぴったり埋める（正方形のとき） */
  fillRows?: boolean
}

export function HomeWorkSection(props: Props) {
  const t = useTranslation()

  return (
    <section className={cn(props.title ? "space-y-4" : "gap-y-4")}>
      <div className="flex items-center justify-between">
        <h2 className="items-center space-x-2 font-bold text-md">
          <span className="text-left font-bold text-xl">
            {props.title && props.title}
          </span>
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
          <Button asChild variant={"secondary"} size={"sm"}>
            <Link to={props.link}>{t("すべて見る", "All")}</Link>
          </Button>
        )}
      </div>
      {props.isCropped ? (
        <HomeCroppedWorkList
          works={props.works}
          autoPlayVideoPreview={props.autoPlayVideoPreview}
          onSelect={props.onSelect}
          fillRows={props.fillRows}
        />
      ) : (
        <ResponsivePhotoWorksAlbum
          works={props.works}
          size="large"
          priorityCount={props.priorityCount}
          targetRowHeight={props.targetRowHeight}
          isShowProfile={props.isShowProfile}
          autoPlayVideoPreview={props.autoPlayVideoPreview}
          compactWhenFew={true}
          onSelect={props.onSelect}
          fillRows={props.fillRows}
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
