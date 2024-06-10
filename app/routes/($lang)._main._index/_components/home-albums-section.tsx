import { ResponsivePhotoVideoWorksAlbum } from "@/_components/responsive-photo-video-works-album"
import {} from "@/_components/ui/carousel"
import type { ResultOf } from "gql.tada"

type Props = {
  albums: NonNullable<ResultOf<typeof albumsQuery>["albums"]> | null
}

/**
 * シリーズ一覧
 */
export const HomeAlbumsSection = (props: Props) => {
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
