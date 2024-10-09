import type { FragmentOf } from "gql.tada"
import type { UserProfileIconFragment } from "~/routes/($lang)._main.users.$user._index/components/user-profile-name-icon"
import { UserContentHeader } from "~/routes/($lang)._main.users.$user._index/components/user-content-header"
import {} from "~/routes/($lang)._main.users.$user.albums/components/user-albums-content-body"
import {
  UserSensitiveVideosContentBody,
  type UserVideosItemFragment,
} from "~/routes/($lang).r.users.$user.videos/components/user-sensitive-videos-content-body"

type Props = {
  user: FragmentOf<typeof UserProfileIconFragment>
  videos: FragmentOf<typeof UserVideosItemFragment>[]
  page: number
  maxCount: number
}

export function UserSensitiveVideosPage(props: Props) {
  return (
    <div className="flex w-full flex-col justify-center">
      <UserContentHeader user={props.user} />
      <UserSensitiveVideosContentBody
        user={props.user}
        videos={props.videos}
        page={props.page}
        maxCount={props.maxCount}
      />
    </div>
  )
}
