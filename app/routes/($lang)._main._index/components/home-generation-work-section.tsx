import { PhotoAlbumWorkFragment } from "~/components/responsive-photo-works-album"
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
import { ResponsivePhotoWorksAlbumWithGenerationButton } from "~/routes/($lang)._main._index/components/responsive-photo-works-album-with-generation-button"

type Props = {
  works: FragmentOf<typeof HomeWorkFragment>[]
  title?: string
  tooltip?: string
  link?: string
  isCropped?: boolean
  targetRowHeight?: number
  isShowProfile?: boolean
  onSelect?: (index: string) => void
}

/**
 * 生成作品セクション専用のワークセクション
 * 各サムネイル下に参照生成ボタンが表示される
 */
export function HomeGenerationWorkSection(props: Props) {
  const t = useTranslation()

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
        <ResponsivePhotoWorksAlbumWithGenerationButton
          works={props.works}
          size="large"
          targetRowHeight={props.targetRowHeight}
          isShowProfile={props.isShowProfile}
          onSelect={props.onSelect}
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
