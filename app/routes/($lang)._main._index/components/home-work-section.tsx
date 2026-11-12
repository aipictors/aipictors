import { Link } from "~/lib/app/locale-router"
import { type FragmentOf, graphql } from "gql.tada"
import {
  PhotoAlbumWorkFragment,
  ResponsivePhotoWorksAlbum,
} from "~/components/responsive-photo-works-album"
import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import { HomeCroppedWorkList } from "~/routes/($lang)._main._index/components/home-cropped-work-list"
import { HomeSectionHeading } from "~/routes/($lang)._main._index/components/home-section-heading"
import { HomeCoppedWorkFragment } from "~/routes/($lang)._main._index/components/home-cropped-work-list-with-scroll"

type Props = {
  works: FragmentOf<typeof HomeWorkFragment>[]
  title?: string
  /** 見出しの下に出す短い説明 */
  description?: React.ReactNode
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
      {props.title ? (
        <HomeSectionHeading
          title={props.title}
          description={props.description}
          tooltip={props.tooltip}
          link={props.link}
          linkLabel={t("すべて見る", "All")}
        />
      ) : (
        props.link && (
          <div className="flex items-center justify-end">
            <Button asChild variant={"secondary"} size={"sm"}>
              <Link to={props.link}>{t("すべて見る", "All")}</Link>
            </Button>
          </div>
        )
      )}
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
