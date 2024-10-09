import type { FragmentOf } from "gql.tada"
import type { UserProfileIconFragment } from "~/routes/($lang)._main.users.$user._index/components/user-profile-name-icon"
import { UserContentHeader } from "~/routes/($lang)._main.users.$user._index/components/user-content-header"
import {} from "~/routes/($lang)._main.users.$user.albums/components/user-albums-content-body"
import {
  UserNovelsContentBody,
  type UserNovelsItemFragment,
} from "~/routes/($lang)._main.users.$user.novels/components/user-novels-content-body"

type Props = {
  user: FragmentOf<typeof UserProfileIconFragment>
  novels: FragmentOf<typeof UserNovelsItemFragment>[]
  page: number
  maxCount: number
}

export function UserNovelsPage(props: Props) {
  return (
    <div className="flex w-full flex-col justify-center">
      <UserContentHeader user={props.user} />
      <UserNovelsContentBody
        user={props.user}
        novels={props.novels}
        page={props.page}
        maxCount={props.maxCount}
      />
    </div>
  )
}
