import { type FragmentOf, graphql } from "gql.tada"
import {
  PhotoAlbumWorkFragment,
  ResponsivePhotoWorksAlbum,
} from "~/components/responsive-photo-works-album"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import { HomeCroppedWorkList } from "~/routes/($lang)._main._index/components/home-cropped-work-list"
import { HomeSectionHeading } from "~/routes/($lang)._main._index/components/home-section-heading"
import { HomeCoppedWorkFragment } from "~/routes/($lang)._main._index/components/home-cropped-work-list-with-scroll"
import type { HomePromotionWorkFragment } from "~/routes/($lang)._main._index/components/home-works-users-recommended-section"

type Props = {
  works: FragmentOf<typeof HomePromotionWorkFragment>[]
  title?: string
  /** 見出しの下に出す短い説明 */
  description?: string
  tooltip?: string
  link?: string
  linkLabel?: string
  isCropped?: boolean
  targetRowHeight?: number
  isShowProfile?: boolean
  autoPlayVideoPreview?: boolean
  /** 先頭から何件の画像を優先して読み込むか（画面の最初に見える一覧で使う） */
  priorityCount?: number
  onSelect?: (index: string) => void
  /** 最後の行の半端な作品を隠して行をぴったり埋める（正方形のとき） */
  fillRows?: boolean
}

export function HomeRecommendedWorkList(props: Props) {
  const t = useTranslation()

  if (props.works.length === 0) {
    return null
  }

  return (
    <section className={cn(props.title ? "space-y-4" : "gap-y-4")}>
      {props.title && (
        <HomeSectionHeading
          title={props.title}
          description={props.description}
          tooltip={props.tooltip}
          link={props.link}
          linkLabel={props.linkLabel ?? t("すべて見る", "All")}
        />
      )}
      {props.isCropped ? (
        <HomeCroppedWorkList
          works={props.works}
          onSelect={props.onSelect}
          fillRows={props.fillRows}
        />
      ) : (
        <ResponsivePhotoWorksAlbum
          works={props.works}
          targetRowHeight={props.targetRowHeight}
          isShowProfile={props.isShowProfile}
          autoPlayVideoPreview={props.autoPlayVideoPreview}
          compactWhenFew={true}
          priorityCount={props.priorityCount}
          onSelect={props.onSelect}
          fillRows={props.fillRows}
        />
      )}
    </section>
  )
}
