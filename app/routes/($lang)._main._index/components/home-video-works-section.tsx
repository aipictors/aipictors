import { ResponsivePhotoVideoWorksAlbum } from "@/components/responsive-photo-video-works-album"
import type { partialWorkFieldsFragment } from "@/graphql/fragments/partial-work-fields"
import type { FragmentOf } from "gql.tada"

type Props = {
  works: FragmentOf<typeof partialWorkFieldsFragment>[]
  title: string
  tooltip?: string
  link?: string
  isCropped?: boolean
}

/**
 * 動画作品一覧
 */
export const HomeVideosWorksSection = (props: Props) => {
  if (!props.works) {
    return null
  }

  return (
    <section className="relative space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="items-center space-x-2 font-bold text-md">
          {props.title}
        </h2>
      </div>

      <ResponsivePhotoVideoWorksAlbum works={props.works} />
    </section>
  )
}
