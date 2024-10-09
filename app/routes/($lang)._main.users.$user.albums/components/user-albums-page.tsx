import { type FragmentOf, graphql } from "gql.tada"
import type { UserProfileIconFragment } from "~/routes/($lang)._main.users.$user._index/components/user-profile-name-icon"
import { PhotoAlbumWorkFragment } from "~/components/responsive-photo-works-album"
import { HomeCoppedWorkFragment } from "~/routes/($lang)._main._index/components/home-cropped-work-list"
import { UserContentHeader } from "~/routes/($lang)._main.users.$user._index/components/user-content-header"
import {
  type UserAlbumListItemFragment,
  UserAlbumsContentBody,
} from "~/routes/($lang)._main.users.$user.albums/components/user-albums-content-body"

type Props = {
  user: FragmentOf<typeof UserProfileIconFragment>
  albums: FragmentOf<typeof UserAlbumListItemFragment>[]
}

export function UserAlbumsPage(props: Props) {
  return (
    <div className="flex w-full flex-col justify-center">
      <UserContentHeader user={props.user} />
      <UserAlbumsContentBody user={props.user} albums={props.albums} />
    </div>
  )
}

export const userHomeMainFragment = graphql(
  `fragment UserHomeMain on UserNode @_unmask {
    id
    login
    isFollowee
    isFollower
    isMuted
    name
    followersCount
    receivedLikesCount
    promptonUser {
      id
    }
  }`,
  [],
)

export const UserWorkFragment = graphql(
  `fragment UserWork on WorkNode @_unmask {
    ...PhotoAlbumWork
    ...HomeCoppedWork
  }`,
  [PhotoAlbumWorkFragment, HomeCoppedWorkFragment],
)
