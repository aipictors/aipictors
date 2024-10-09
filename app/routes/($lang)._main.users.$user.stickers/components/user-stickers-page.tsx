import type { FragmentOf } from "gql.tada"
import type { UserProfileIconFragment } from "~/routes/($lang)._main.users.$user._index/components/user-profile-name-icon"
import { UserContentHeader } from "~/routes/($lang)._main.users.$user._index/components/user-content-header"
import {} from "~/routes/($lang)._main.users.$user.albums/components/user-albums-content-body"
import {
  UserStickersContentBody,
  type UserStickersItemFragment,
} from "~/routes/($lang)._main.users.$user.stickers/components/user-stickers-content-body"

type Props = {
  user: FragmentOf<typeof UserProfileIconFragment>
  stickers: FragmentOf<typeof UserStickersItemFragment>[]
  page: number
  maxCount: number
  isSensitive?: boolean
}

export function UserStickersPage(props: Props) {
  return (
    <div className="flex w-full flex-col justify-center">
      <UserContentHeader user={props.user} />
      <UserStickersContentBody
        user={props.user}
        stickers={props.stickers}
        page={props.page}
      />
    </div>
  )
}
