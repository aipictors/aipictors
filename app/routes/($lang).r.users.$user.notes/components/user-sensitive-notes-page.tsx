import type { FragmentOf } from "gql.tada"
import type { UserProfileIconFragment } from "~/routes/($lang)._main.users.$user._index/components/user-profile-name-icon"
import { UserContentHeader } from "~/routes/($lang)._main.users.$user._index/components/user-content-header"
import {} from "~/routes/($lang)._main.users.$user.albums/components/user-albums-content-body"
import {
  type UserNotesItemFragment,
  UserSensitiveNotesContentBody,
} from "~/routes/($lang).r.users.$user.notes/components/user-sensitive-notes-content-body"

type Props = {
  user: FragmentOf<typeof UserProfileIconFragment>
  notes: FragmentOf<typeof UserNotesItemFragment>[]
  page: number
  maxCount: number
}

export function UserSensitiveNotesPage(props: Props) {
  return (
    <div className="flex w-full flex-col justify-center">
      <UserContentHeader user={props.user} />
      <UserSensitiveNotesContentBody
        user={props.user}
        notes={props.notes}
        page={props.page}
        maxCount={props.maxCount}
      />
    </div>
  )
}
