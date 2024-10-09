import type { FragmentOf } from "gql.tada"
import type { UserProfileIconFragment } from "~/routes/($lang)._main.users.$user._index/components/user-profile-name-icon"
import { UserContentHeader } from "~/routes/($lang)._main.users.$user._index/components/user-content-header"
import {} from "~/routes/($lang)._main.users.$user.albums/components/user-albums-content-body"
import {
  UserVideosContentBody,
  type UserVideosItemFragment,
} from "~/routes/($lang)._main.users.$user.videos/components/user-videos-content-body"

type Props = {
  user: FragmentOf<typeof UserProfileIconFragment>
  videos: FragmentOf<typeof UserVideosItemFragment>[]
  page: number
  maxCount: number
}

export function UserVideosPage(props: Props) {
  return (
    <div className="flex w-full flex-col justify-center">
      <UserContentHeader user={props.user} />
      <UserVideosContentBody
        user={props.user}
        videos={props.videos}
        page={props.page}
        maxCount={props.maxCount}
      />
    </div>
  )
}
