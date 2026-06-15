import { useQuery } from "@apollo/client/index"
import { type FragmentOf, graphql, readFragment } from "gql.tada"
import { UserActionOther } from "~/routes/($lang)._main.users.$user._index/components/user-action-other"

type Props = {
  user: FragmentOf<typeof UserHomeMenuFragment>
}

export function UserHomeMenu(props: Props) {
  const cachedUser = readFragment(UserHomeMenuFragment, props.user)

  const { data = null } = useQuery(UserQuery, {
    variables: { userId: decodeURIComponent(cachedUser.id) },
  })

  const user = readFragment(UserHomeMenuFragment, data?.user) ?? cachedUser

  const isMuted = Boolean(user.isMuted)

  const isBlocked = Boolean(user.isBlocked)

  return (
    <div className="mx-auto w-full max-w-6xl px-4 md:px-8">
      {/* Desktop actions */}
      <div className="mt-4 hidden w-full items-center justify-end gap-3 md:flex md:gap-4">
        <UserActionOther id={user.id} isMuted={isMuted} isBlocked={isBlocked} />
      </div>
    </div>
  )
}

export const UserHomeMenuFragment = graphql(
  `fragment UserHomeMenuFragment on UserNode {
    id
    login
    isFollowee
    isFollower
    isMuted
    isBlocked
    name
    followersCount
    receivedLikesCount
    receivedSensitiveLikesCount
  }`,
  [],
)

const UserQuery = graphql(
  `query User($userId: ID!) {
    user(id: $userId) {
      ...UserHomeMenuFragment
    }
  }`,
  [UserHomeMenuFragment],
)
