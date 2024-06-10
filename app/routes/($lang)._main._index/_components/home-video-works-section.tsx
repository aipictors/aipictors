import { ResponsivePhotoVideoWorksAlbum } from "@/_components/responsive-photo-video-works-album"
import {} from "@/_components/ui/carousel"
import type { worksQuery } from "@/_graphql/queries/work/works"
import type { ResultOf } from "gql.tada"

type Props = {
  works: NonNullable<ResultOf<typeof worksQuery>["works"]> | null
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
