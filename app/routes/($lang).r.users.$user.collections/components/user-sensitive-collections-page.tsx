import type { FragmentOf } from "gql.tada"
import type { UserProfileIconFragment } from "~/routes/($lang)._main.users.$user._index/components/user-profile-name-icon"
import { UserContentHeader } from "~/routes/($lang)._main.users.$user._index/components/user-content-header"
import {} from "~/routes/($lang)._main.users.$user.albums/components/user-albums-content-body"
import {
  UserSensitiveCollectionsContentBody,
  type UserUserFoldersItemFragment,
} from "~/routes/($lang).r.users.$user.collections/components/user-sensitive-collections-content-body"

type Props = {
  user: FragmentOf<typeof UserProfileIconFragment>
  folders: FragmentOf<typeof UserUserFoldersItemFragment>[]
}

export function UserSensitiveCollectionsPage(props: Props) {
  return (
    <div className="flex w-full flex-col justify-center">
      <UserContentHeader user={props.user} />
      <UserSensitiveCollectionsContentBody
        user={props.user}
        folders={props.folders}
      />
    </div>
  )
}
