import { type FragmentOf, graphql } from "gql.tada"
import type { UserProfileIconFragment } from "~/routes/($lang)._main.users.$user._index/components/user-profile-name-icon"
import { PhotoAlbumWorkFragment } from "~/components/responsive-photo-works-album"
import { UserContentHeader } from "~/routes/($lang)._main.users.$user._index/components/user-content-header"
import { UserSensitiveContentBody } from "~/routes/($lang).r.users.$user._index/components/user-sensitive-content-body"

type Props = {
  user: FragmentOf<typeof UserProfileIconFragment>
  isSensitive?: boolean
  works?: FragmentOf<typeof UserWorkFragment>[]
  novelWorks?: FragmentOf<typeof UserWorkFragment>[]
  columnWorks?: FragmentOf<typeof UserWorkFragment>[]
  videoWorks?: FragmentOf<typeof UserWorkFragment>[]
  worksCount?: number
}

export function UserSensitivePage(props: Props) {
  return (
    <div className="flex w-full flex-col justify-center">
      <UserContentHeader user={props.user} />
      <UserSensitiveContentBody
        user={props.user}
        works={props.works}
        novelWorks={props.novelWorks}
        columnWorks={props.columnWorks}
        videoWorks={props.videoWorks}
        worksCount={props.worksCount}
      />
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
  }`,
  [PhotoAlbumWorkFragment],
)
