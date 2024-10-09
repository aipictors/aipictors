import type { FragmentOf } from "gql.tada"
import type { UserProfileIconFragment } from "~/routes/($lang)._main.users.$user._index/components/user-profile-name-icon"
import { UserContentHeader } from "~/routes/($lang)._main.users.$user._index/components/user-content-header"
import {} from "~/routes/($lang)._main.users.$user.albums/components/user-albums-content-body"
import {
  UserNotesContentBody,
  type UserNotesItemFragment,
} from "~/routes/($lang)._main.users.$user.notes/components/user-notes-content-body"

type Props = {
  user: FragmentOf<typeof UserProfileIconFragment>
  notes: FragmentOf<typeof UserNotesItemFragment>[]
  page: number
  maxCount: number
}

export function UserNotesPage(props: Props) {
  return (
    <div className="flex w-full flex-col justify-center">
      <UserContentHeader user={props.user} />
      <UserNotesContentBody
        user={props.user}
        notes={props.notes}
        page={props.page}
        maxCount={props.maxCount}
      />
    </div>
  )
}
