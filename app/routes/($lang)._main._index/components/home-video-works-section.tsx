import {
  PhotoAlbumVideoWorkFragment,
  ResponsivePhotoVideoWorksAlbum,
} from "~/components/responsive-photo-video-works-album"
import { graphql, type FragmentOf } from "gql.tada"

type Props = {
  works: FragmentOf<typeof HomeVideosWorkListItemFragment>[]
  title?: string
  tooltip?: string
  link?: string
  isCropped?: boolean
  isAutoPlay?: boolean
  onSelect?: (index: string) => void
}

/**
 * 動画作品一覧
 */
export function HomeVideosWorksSection (props: Props) {
  if (props.works.length === 0) {
    return null
  }

  return (
    <section className="relative space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="items-center space-x-2 font-bold text-md">
          {props.title && props.title}
        </h2>
      </div>

      <ResponsivePhotoVideoWorksAlbum
        isAutoPlay={props.isAutoPlay}
        works={props.works}
      />
    </section>
  )
}

export const HomeVideosWorkListItemFragment = graphql(
  `fragment HomeVideosWorkListItem on WorkNode @_unmask {
    id
    ...PhotoAlbumVideoWork
  }`,
  [PhotoAlbumVideoWorkFragment],
)
