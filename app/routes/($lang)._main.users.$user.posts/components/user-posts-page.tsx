import type { FragmentOf } from "gql.tada"
import type { UserProfileIconFragment } from "~/routes/($lang)._main.users.$user._index/components/user-profile-name-icon"
import { UserContentHeader } from "~/routes/($lang)._main.users.$user._index/components/user-content-header"
import {
  UserPostsContentBody,
  type UserPostsItemFragment,
} from "~/routes/($lang)._main.users.$user.posts/components/user-posts-content-body"

type Props = {
  user: FragmentOf<typeof UserProfileIconFragment>
  posts: FragmentOf<typeof UserPostsItemFragment>[]
  page: number
  maxCount: number
  isSensitive?: boolean
}

export function UserPostsPage(props: Props) {
  return (
    <div className="flex w-full flex-col justify-center">
      <UserContentHeader user={props.user} />
      <UserPostsContentBody
        user={props.user}
        posts={props.posts}
        page={props.page}
        maxCount={props.maxCount}
      />
    </div>
  )
}
