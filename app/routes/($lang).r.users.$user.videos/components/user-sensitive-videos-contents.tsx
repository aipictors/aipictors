import type { FragmentOf } from "gql.tada"
import { ResponsivePhotoVideoWorksAlbum } from "~/components/responsive-photo-video-works-album"
import type { UserVideosItemFragment } from "~/routes/($lang)._main.users.$user.videos/components/user-videos-content-body"

type Props = {
  videos: FragmentOf<typeof UserVideosItemFragment>[]
}

export function UserSensitiveVideosContents(props: Props) {
  return (
    <ResponsivePhotoVideoWorksAlbum isAutoPlay={true} works={props.videos} />
  )
}
